#!/usr/bin/env python3
"""
迷宫游戏单文件生成工具

该脚本用于将迷宫游戏的所有资源文件打包成一个HTML文件，便于离线使用。
"""

import os


def generate_html(output_path):
    """
    生成包含所有内联资源的HTML文件
    
    Args:
        output_path: 输出HTML文件的路径
    """
    # 定义需要包含的资源文件
    resources = [
        {"filename": "index.html", "content_type": "text/html"},
        {"filename": "style.css", "content_type": "text/css"},
        {"filename": "config.js", "content_type": "application/javascript"},
        {"filename": "state.js", "content_type": "application/javascript"},
        {"filename": "maze.js", "content_type": "application/javascript"},
        {"filename": "player.js", "content_type": "application/javascript"},
        {"filename": "items.js", "content_type": "application/javascript"},
        {"filename": "game.js", "content_type": "application/javascript"}
    ]
    
    # 创建HTML内容列表
    html_content = ""
    
    # 当前工作目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 收集所有JS内容，用于合并
    js_contents = []
    html_content = ""
    css_content = ""
    
    # 读取所有资源
    for resource in resources:
        filename = resource["filename"]
        content_type = resource["content_type"]
        
        # 读取文件内容
        file_path = os.path.join(current_dir, filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if content_type == "text/html":
                import re
                content = re.sub(r'src="([^"]+)\?[^"]*"', r'src="\1"', content)
                content = re.sub(r'href="([^"]+)\?[^"]*"', r'href="\1"', content)
                # 确保HTML文件头部有正确的UTF-8编码声明
                if '<meta charset="UTF-8">' not in content:
                    content = content.replace('<head>', '<head>\n    <meta charset="UTF-8">')
                # 保存HTML内容，后续会修改script标签
                html_content = content
            
            elif content_type == "text/css":
                # 为user-select属性添加-webkit-user-select前缀以支持Safari
                import re
                content = re.sub(r'user-select:\s*([^;]+);', r'-webkit-user-select: \1;\n    user-select: \1;', content)
                # 保存CSS内容
                css_content = content
            
            elif content_type == "application/javascript":
                import re
                # 移除import语句
                content = re.sub(r'import\s+\{[^}]+\}\s+from\s+[\'"]\./[^\'"]+[\'"];', '', content)
                # 移除export语句
                content = re.sub(r'export\s+\{[^}]+\};', '', content)
                content = re.sub(r'export\s+const\s+', 'const ', content)
                content = re.sub(r'export\s+let\s+', 'let ', content)
                content = re.sub(r'export\s+function\s+', 'function ', content)
                content = re.sub(r'export\s+class\s+', 'class ', content)
                # 添加到JS内容列表
                js_contents.append(content)
            
        except Exception as e:
            print(f"警告：无法读取文件 {filename}: {e}")
    
    # 修改HTML，将所有JS合并到一个script标签中，将CSS内联到HTML中
    import re
    # 移除所有script标签（包括内联和外部引用）
    html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL)
    # 移除所有CSS link标签（包括style.css和其他可能的CSS文件）
    html_content = re.sub(r'<link[^>]*rel="stylesheet"[^>]*>', '', html_content)
    # 移除所有其他外部资源引用
    html_content = re.sub(r'<img[^>]*src="[^"]+"[^>]*>', '', html_content)
    # 在head中添加meta标签设置content-security-policy，解决浏览器沙箱限制问题
    html_content = html_content.replace('<head>', '<head>\n    <meta http-equiv="Content-Security-Policy" content="default-src \'self\' \'unsafe-inline\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\';">')
    # 在head中添加内联CSS
    html_content = html_content.replace('</head>', '<style>\n' + css_content + '\n</style>\n</head>')
    # 在body结束前添加合并后的script标签
    html_content = html_content.replace('</body>', '<script>\n' + '\n'.join(js_contents) + '\n</script>\n</body>')
    
    # 合并内容并写入文件
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"HTML文件已成功生成：{output_path}")
        print(f"文件大小：{os.path.getsize(output_path) / 1024:.2f} KB")
        
    except Exception as e:
        print(f"错误：无法写入HTML文件 {output_path}: {e}")


if __name__ == "__main__":
    """主函数"""
    import argparse
    
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='生成迷宫游戏的单文件HTML')
    parser.add_argument('-o', '--output', default='maze-game.html', help='输出HTML文件路径')
    args = parser.parse_args()
    
    # 生成HTML文件
    generate_html(args.output)
