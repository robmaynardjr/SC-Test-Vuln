pipeline {
  environment {
    registry = "registry.hub.docker.com"
    registryCredential = 'dockerhub'
    imgName = 'robmaynard/sc-test-vuln:latest'
    gitRepo = "https://github.com/robmaynardjr/SC-Test-Vuln.git"
    smartCheckHost = "10.0.10.100"
  }
  
    agent { label 'jenkins-jenkins-slave ' }

    stages {
        stage("Building image") {
            steps{
                container('jnlp') {
                    script {
                        dockerImage = docker.build(imgName)
                    }
                }
            }
        }

        stage("Stage Image") {
            steps{
                container('jnlp') {
                    script {
                        withCredentials([
                            usernamePassword([
                                credentialsId: 'dockerhub', 
                                passwordVariable: 'PASS', 
                                usernameVariable: 'USER',
                                ])
                            ]) {

                            // docker.withRegistry('', registryCredential ) {
                            //     dockerImage.push()
                            echo "Logging into Dockerhub..."
                            sh "docker login -u '${USER}' -p '${PASS}'"
                            echo "Pushing Image..."
                            sh "docker push ${imgName}"                       
                            }
                        }   
                    }
                }
            }
        stage("Security Check") {
            steps {
                container('jnlp') {
                    script {
                        withCredentials([
                            usernamePassword([
                                credentialsId: "dockerhub",
                                usernameVariable: "USER",
                                passwordVariable: "PASSWORD",
                            ]),
                            usernamePassword([
                                credentialsId: "smart-check-jenkins-user",
                                usernameVariable: "SCUSER",
                                passwordVariable: "SCPASSWORD",
                            ])   
                        ]){
                            sh "docker login -u '${USER}' -p '${PASSWORD}'"
                            def imgPAuth = " {\"username\":\"${USER}\",\"password\":\"${PASSWORD}\"} "
                            def findings =  " {\"malware\":0,\"vulnerabilities\":{\"defcon1\":0,\"critical\":20,\"high\":200},\"contents\":{\"defcon1\":0,\"critical\":0,\"high\":0},\"checklists\":{\"defcon1\":0,\"critical\":0,\"high\":0} } "
                            sh "docker run deepsecurity/smartcheck-scan-action --image-name registry.hub.docker.com/robmaynard/sc-test-vuln:latest --smartcheck-host=10.0.10.100 --smartcheck-user='$SCUSER' --smartcheck-password='${SCPASSWORD}' --insecure-skip-tls-verify --findings-threshold='${findings}' --image-pull-auth='${imgPAuth}'"
                        }
                    }
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