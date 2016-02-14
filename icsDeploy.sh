#!/bin/bash
#!/bin/bash
# The following are some example deployment scripts.  Use these as is or fork them and include your updates here:
echo -e "${label_color}Starting deployment script${no_color}"


# To view/fork this script goto: https://github.com/Osthanes/deployscripts
# git_retry will retry git calls to prevent pipeline failure on temporary github problems
# the code can be found in git_util.sh at https://github.com/Osthanes/container_deployer
git_retry clone https://github.com/Osthanes/deployscripts.git deployscripts


# You can deploy your Image as either a single Container or as a Container 
# Group.  A Container Group deploys a number of containers to enhance
# scalability or reliability.  By default we will deploy as a single 
# container.  To switch to a group deploy, comment out the line below
# containing deploycontainer.sh and uncomment the line for deploygroup.sh

# Deploy with containers:
# Optional environment properties (can be set directly in this script, or defined as environment properties):
#      NAME              Value         Description
#   =============      =========     ==============
#   BIND_TO             String       Specify a Bluemix application name that whose bound services you wish to make available to the container.  By default this is not set.
#   CONTAINER_SIZE      String       Specify container size: pico (64), nano (128), micro (256), tiny (512), small (1024), medium (2048),
#                                                            large (4096), x-large (8192), 2x-large (16384).
#                                    Default is micro (256).
#   CONCURRENT_VERSIONS Number       Number of versions of this container to leave active.  
#                                    Default is 1
#
/bin/bash deployscripts/deploycontainer.sh

# Deploy Container Group:
# Optional environment properties (can be set directly in this script, or defined as environment properties):
#      NAME              Value         Description
#   =============      =========     ==============
#   ROUTE_HOSTNAME      String       Specify the Hostname for the Cloud Foundry Route you wish to assign to this container group.  By default this is not set.
#   ROUTE_DOMAIN        String       Specify domain name for the Cloud Foundry Route you wish to assign to this container group.  By default this is not set.
#   BIND_TO             String       Specify a Bluemix application name that whose bound services you wish to make available to the container.  By default this is not set.
#   DESIRED_INSTANCES:  Number       Specify the number of instances in the group.  Default value is 1.
#   AUTO_RECOVERY:      Boolean      Set auto-recovery to true/false.  Default value is false.

#                                    Default is false.
#   CONTAINER_SIZE      String       Specify container size: pico (64), nano (128), micro (256), tiny (512), small (1024), medium (2048),
#                                                            large (4096), x-large (8192), 2x-large (16384).
#                                    Default is micro (256).
#   CONCURRENT_VERSIONS Number       Number of versions of this group to leave active.
#                                    Default is 1
# IF YOU WANT CONTAINER GROUPS .. uncomment the next line, and comment out the previous deployment line (/bin/bash deployscripts/deploygroup.sh)
#/bin/bash deployscripts/deploygroup.sh

RESULT=$?

# source the deploy property file
if [ -f "${DEPLOY_PROPERTY_FILE}" ]; then
  source "$DEPLOY_PROPERTY_FILE"
fi

#########################
# Environment DETAILS   #
#########################
# The environment has been setup.
# The Cloud Foundry CLI (cf), IBM Container Service CLI (ice), Git client (git), IDS Inventory CLI (ids-inv) and Python 2.7.3 (python) have been installed.
# Based on the organization and space selected in the Job credentials are in place for both IBM Container Service and IBM Bluemix

# The following colors have been defined to help with presentation of logs: green, red, label_color, no_color.
if [ $RESULT -ne 0 ]; then
    echo -e "${red}Executed failed or had warnings ${no_color}"
    ${EXT_DIR}/print_help.sh
    exit $RESULT
fi
echo -e "${green}Execution complete${no_label}"
