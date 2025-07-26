set -e

# 修复 node_modules 权限（如果存在）
if [ -d "/workspaces/learnify/node_modules" ]; then
    echo "正在修复 node_modules 权限..."
    sudo chown -R vscode:vscode /workspaces/learnify/node_modules
fi

npm install -g @withgraphite/graphite-cli@stable

if [ -v GRAPHITE_TOKEN ];then
    gt auth --token $GRAPHITE_TOKEN
fi

gt init --trunk canary
