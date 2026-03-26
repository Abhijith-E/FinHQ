import os
import re

directories_to_scan = [
    '/Users/abhijith/Documents/fintechphase2/frontend/components',
    '/Users/abhijith/Documents/fintechphase2/frontend/app',
]

for directory in directories_to_scan:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                original_content = content
                
                # Revert ' ₹{' back to ' ${' which broke template literals with spaces
                content = content.replace(' ₹{', ' ${')
                content = content.replace('`₹{', '`${')
                content = content.replace('="₹{', '="${')
                
                # Fix Apple Inc. to Reliance Industries
                content = content.replace('Apple Inc.', 'Reliance Industries Ltd')
                content = content.replace('NVIDIA Corporation', 'Tata Consultancy Services Ltd')
                
                # Fix Portfolio page lingering $
                content = content.replace('+$', '+₹')
                content = content.replace('-$', '-₹')
                content = content.replace(' - $', ' - ₹')
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed templates in {filepath}")
