#!/bin/bash

# Script to push project to GitHub
echo "🚀 Push Shop Affiliate to GitHub"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found!"
    exit 1
fi

# Get GitHub username
read -p "📝 Nhập tên GitHub của bạn: " username

if [ -z "$username" ]; then
    echo "❌ Tên GitHub không được để trống!"
    exit 1
fi

# Get repository name
read -p "📝 Nhập tên repository (mặc định: shop-affiliate): " reponame
reponame=${reponame:-shop-affiliate}

# Construct GitHub URL
github_url="https://github.com/$username/$reponame.git"

echo ""
echo "🔗 Repository URL: $github_url"
echo ""

# Confirm
read -p "✅ Bạn có muốn tiếp tục đẩy lên GitHub? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Đã hủy thao tác!"
    exit 0
fi

echo ""
echo "🔄 Đang thêm remote..."
git remote add origin $github_url

echo "🔄 Đang đẩy lên GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Đẩy lên GitHub thành công!"
    echo "🌐 Repository của bạn: $github_url"
else
    echo ""
    echo "❌ Đẩy lên GitHub thất bại!"
    echo "💡 Vui lòng kiểm tra:"
    echo "   - Tên GitHub có đúng không?"
    echo "   - Repository đã được tạo trên GitHub chưa?"
    echo "   - Bạn có quyền truy cập repository không?"
fi