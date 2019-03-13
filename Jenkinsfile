def scanImage(Map config) {
  assert (config.registry?.trim() as boolean)
  assert (config.repository?.trim() as boolean)
  assert (config.tag?.trim() as boolean)
  assert config.registryAccessKey != null
  assert config.registrySecret != null

  // DSSC config
  def smartcheckConfig = [
      host: "10.0.10.100"  // Config with SC address
  ]
  withCredentials([
      usernamePassword(credentialsId: 'smart-check-jenkins-user', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD') // Add creds in Jenkins cred manager
  ]) {
      smartcheckConfig.userID = USERNAME
      smartcheckConfig.password = PASSWORD
  }

  // Login
  echo "Logging in..."
  def sessionResponse = httpRequest(
      ignoreSslErrors: true,
      url: "https://${smartcheckConfig.host}/api/sessions",
      acceptType:  "APPLICATION_JSON",
      contentType: "APPLICATION_JSON",
      httpMode: "POST",
      requestBody: """
      {
        "user": {
          "userID": "${smartcheckConfig.userID}",
          "password": "${smartcheckConfig.password}"
        }
      }
      """
  )
  echo 'Session request status: ' + sessionResponse.status
  assert sessionResponse.status == 201
  echo "Login success"

  def session = readJSON text: sessionResponse.content

   // Request a scan
  def hook = registerWebhook()
  echo "Requesting scan for ${config.registry}/${config.repository}:${config.tag} ..."

  String scanRequestBody = """
      {
        "source": {
          "type": "docker",
          "registry": "${config.registry}",
          "repository": "${config.repository}",
          "tag": "${config.tag}",
          "credentials": {
            "aws": {
              "region": "us-east-2",
              "accessKeyID": "${config.registryAccessKey}",
              "secretAccessKey":"${config.registrySecret}"
            }
          } ,
          "insecureSkipVerify": true
        },
        "webhooks": [
          {
            "hookURL": "${ hook.getURL() }",
            "secret": "string (password)",
            "insecureSkipVerify": true,
            "active": true,
            "events": [ "scan-completed" ]
          }
        ]
      }
      """
      

  try {
      readJSON text: scanRequestBody
  } catch (error) {
      error( "Failed to parse body. ${error}" )
  }

  echo "assign token"
  String sessionToken = session.token

  def scanResponse = httpRequest(
      ignoreSslErrors: true,
      url: "https://${smartcheckConfig.host}/api/scans",
      acceptType:  "APPLICATION_JSON",
      contentType: "APPLICATION_JSON",
      httpMode: "POST",
      customHeaders: [[
          "name": "Authorization",
          "value": "Bearer ${session.token}"
      ]],
      requestBody: scanRequestBody
  )
  echo "after request"

  assert scanResponse.status == 201
  echo "Scan requested successfully."

  def scanStarted = readJSON text: scanResponse.content
  echo "Scan href: ${scanStarted.href}"
  // link to the UI for details
  echo "See details: https://${smartcheckConfig.host}/scans/${scanStarted.id}"

  // Wait for status update
  echo "Waiting for scan to complete..."
  String data = waitForWebhook hook
  echo "Webhook called."

  // TODO There is a bug currently in the webhook-step-plugin
  // need to wait for this PR to be merged https://github.com/jenkinsci/webhook-step-plugin/pull/6
  //def event = readJSON text: data
  //def scan = event.scan

  // Workaround:
  echo "Fetching scan status"
  def finishedScanResponse = httpRequest(
      ignoreSslErrors: true,
      url: "https://${smartcheckConfig.host}${scanStarted.href}",
      acceptType:  "APPLICATION_JSON",
      contentType: "APPLICATION_JSON",
      httpMode: "GET",
      customHeaders: [[
          "name": "Authorization",
          "value": "Bearer ${session.token}"
      ]]
  )
  echo "Got scan status"

  def scan = readJSON text: finishedScanResponse.content

  echo scan.status

  switch (scan.status) {
      case "failed":
          echo "Scan failed."
          break
      case "completed-with-findings":
          if (scan.findings.malware > 0){
              // this will fail the build
              error("Scan found ${scan.findings.malware} malware!")
          }
          // This is just an example, would probably want to pass off to a
          // more detailed parser for what vulnerabilities to flag on
          else if (scan.findings?.unresolved?.critical && scan.findings?.unresolved?.critical > 0) {
              echo "Scan found ${scan.findings.unresolved.critical} unresolved critical vulnerabilites."
              currentBuild.result = "UNSTABLE"
          }
          break
      case "completed-no-findings":
          echo "Scan found no issues."
          break
      default:
          echo "Got scan status for event we are not registered for: ${scan.status}"
          break
  }
}

pipeline {
  environment {
    registry = "https://279773871986.dkr.ecr.us-east-2.amazonaws.com"
    repository = "sc-test-vuln"
    registryCredential = 'ecr:us-east-2:ecr'
    dockerImage = ""

    
  }
  agent any
  stages {
    stage("Cloning Git Repo") {
      steps {
        git "https://github.com/robmaynardjr/SC-Test-Vuln.git"
      }
    }
    stage("Building image") {
      steps{
        script {
          dockerImage = docker.build('279773871986.dkr.ecr.us-east-2.amazonaws.com/sc-test-vuln:latest')
        }
      }
    }
    stage("Stage Image") {
      steps{
        script {
          docker.withRegistry((registry + "/" + repository), registryCredential ) {
            dockerImage.push()
          }
        }
      }
    }
    stage("Smart Check Scan") {
      steps {
        script{
          // Parameters for Smart Check scan function 
          def config = [
            registry: registry,
            repository: repository,
            tag: "latest"
          ]
          // Adds AWS ECR Credentials to config
          withCredentials([[
            $class: 'AmazonWebServicesCredentialsBinding', 
            credentialsId: 'ecr', 
            accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
            secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
            ]]) {
              config.registryAccessKey = AWS_ACCESS_KEY_ID
              config.registrySecret = AWS_SECRET_ACCESS_KEY
            }

          scanImage(config)
        }
      }
    }
    stage ("Deploy to Cluster") {
      steps{
        echo "Function to be added at a later date."
      }
    }
  }
}

// Change in comments