#!/bin/bash

# Cloud Run IAM 策略管理脚本
# 使用方法: ./scripts/manage-cloud-run-iam.sh [canary|beta] [set|remove|check]

set -e

# 参数检查
if [ $# -ne 2 ]; then
    echo "用法: $0 [canary|beta] [set|remove|check]"
    echo "  set    - 设置公共访问权限"
    echo "  remove - 移除公共访问权限"
    echo "  check  - 检查当前IAM策略"
    exit 1
fi

FLAVOR=$1
ACTION=$2

# 验证 flavor 参数
if [ "$FLAVOR" != "canary" ] && [ "$FLAVOR" != "beta" ]; then
    echo "错误: flavor 必须是 'canary' 或 'beta'"
    exit 1
fi

# 验证 action 参数
if [ "$ACTION" != "set" ] && [ "$ACTION" != "remove" ] && [ "$ACTION" != "check" ]; then
    echo "错误: action 必须是 'set', 'remove' 或 'check'"
    exit 1
fi

# 设置基本环境变量
GCP_PROJECT="learnify-463605"
SERVICE_NAME="learnify-$FLAVOR"

# 根据不同 flavor 设置对应的区域
if [ "$FLAVOR" = "canary" ]; then
    GCP_REGION="asia-east2"
else
    GCP_REGION="australia-southeast2"
fi

echo "=========================================="
echo "IAM 策略管理:"
echo "  Flavor: $FLAVOR"
echo "  项目: $GCP_PROJECT"
echo "  区域: $GCP_REGION"
echo "  服务名: $SERVICE_NAME"
echo "  操作: $ACTION"
echo "=========================================="

# 检查 gcloud 认证
echo "检查 gcloud 认证状态..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "错误: 未找到活跃的 gcloud 认证。请先运行: gcloud auth login"
    exit 1
fi

# 设置项目
echo "设置 GCP 项目..."
gcloud config set project $GCP_PROJECT

# 检查服务是否存在
echo "检查 Cloud Run 服务是否存在..."
if ! gcloud run services describe $SERVICE_NAME --region=$GCP_REGION >/dev/null 2>&1; then
    echo "错误: 服务 $SERVICE_NAME 不存在"
    exit 1
fi

case $ACTION in
    "set")
        echo "设置公共访问权限..."
        read -p "确认为服务 $SERVICE_NAME 设置公共访问权限? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            gcloud run services add-iam-policy-binding $SERVICE_NAME \
                --region=$GCP_REGION \
                --member="allUsers" \
                --role="roles/run.invoker"
            
            if [ $? -eq 0 ]; then
                echo "IAM 策略设置成功!"
            else
                echo "错误: IAM 策略设置失败"
                exit 1
            fi
        else
            echo "操作已取消"
        fi
        ;;
    
    "remove")
        echo "移除公共访问权限..."
        read -p "确认为服务 $SERVICE_NAME 移除公共访问权限? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            gcloud run services remove-iam-policy-binding $SERVICE_NAME \
                --region=$GCP_REGION \
                --member="allUsers" \
                --role="roles/run.invoker"
            
            if [ $? -eq 0 ]; then
                echo "IAM 策略移除成功!"
            else
                echo "错误: IAM 策略移除失败"
                exit 1
            fi
        else
            echo "操作已取消"
        fi
        ;;
    
    "check")
        echo "检查当前 IAM 策略..."
        gcloud run services get-iam-policy $SERVICE_NAME \
            --region=$GCP_REGION
        ;;
esac

# 获取服务 URL
echo "获取服务 URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$GCP_REGION --format="value(status.url)")
echo "服务 URL: $SERVICE_URL"

echo "=========================================="
echo "操作完成!"
echo "服务名: $SERVICE_NAME"
echo "区域: $GCP_REGION"
echo "URL: $SERVICE_URL"
echo "==========================================" 