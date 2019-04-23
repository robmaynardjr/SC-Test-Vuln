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
          docker.withRegistry('https://registry.hub.docker.com', registryCredential ) {
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
                    imageName: "registry.hub.docker.com/robmaynard/sc-test-vuln:latest",
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