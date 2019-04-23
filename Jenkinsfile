pipeline {
  environment {
    registry = "robmaynard/sc-test-vuln"
    registryCredential = 'dockerhub'
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
          dockerImage = docker.build('robmaynard/sc-test-vuln:latest')
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
            withCredentials([
                usernamePassword([
                    credentialsId: "dockerhub",
                    usernameVariable: "USER",
                    passwordVariable: "PASSWORD",
                ])             
            ]){            
                smartcheckScan([
                    imageName: "hub.docker.com/r/robmaynard/sc-test-vuln",
                    smartcheckHost: "10.0.10.100",
                    insecureSkipTLSVerify: true,
                    smartcheckCredentialsId: "smart-check-jenkins-user",
                    imagePullAuth: new groovy.json.JsonBuilder([
                        username: USER,
                        password: PASSWORD,
                        ]).toString(),
                    ])
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