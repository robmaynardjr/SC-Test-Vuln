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
            
                smartcheckScan([
                    imageName: "279773871986.dkr.ecr.us-east-2.amazonaws.com/sc-test-vuln",
                    smartcheckHost: "10.0.10.100",
                    smartcheckCredentialsId: "smart-check-jenkins-user"
                    // imagePullAuth: new groovy.json.JsonBuilder([
                    // //     username: REGISTRY_USER,
                    // //     password: REGISTRY_PASSWORD,
                    // //     ]).toString(),
                    ])
                }
            }
        

    stage ("Deploy to Cluster") {
      steps{
        echo "Function to be added at a later date."
      }
    }
  }
}