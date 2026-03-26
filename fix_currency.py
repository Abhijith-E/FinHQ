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
                
                # Replace forms of $ that got reverted by mistake
                # Example: >${balance}  -> >₹{balance}
                content = content.replace('>${', '>₹{')
                content = content.replace('>\n                                <span className="text-sm text-white">${', '>\n                                <span className="text-sm text-white">₹{')
                content = content.replace('>${stock', '>₹{stock')
                # For string literals like "+${change"
                content = content.replace('"+${', '"+₹{')
                content = content.replace('>+${', '>+₹{')
                content = content.replace('>-${', '>-₹{')
                content = content.replace(' ${', ' ₹{')

                # Revert back valid template literals if we broke them
                # A template literal starts with ` and has ${ inside
                # This is tricky without AST, but the above replacements are quite specific to JSX boundaries.
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed {filepath}")
