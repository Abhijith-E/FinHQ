import os
import re

directories_to_scan = [
    '/Users/abhijith/Documents/fintechphase2/frontend/components',
    '/Users/abhijith/Documents/fintechphase2/frontend/app',
    '/Users/abhijith/Documents/fintechphase2/frontend/lib'
]

ticker_replacements = {
    'AAPL': 'RELIANCE.NS',
    'NVDA': 'TCS.NS',
    'MSFT': 'HDFCBANK.NS',
    'AMZN': 'INFY.NS',
    'TSLA': 'ICICIBANK.NS',
    'META': 'SBIN.NS',
    'GOOGL': 'BHARTIARTL.NS',
    'BRK.B': 'ITC.NS',
    'JPM': 'LT.NS',
    'V': 'HINDUNILVR.NS',
    'AMD': 'AXISBANK.NS',
    'NFLX': 'KOTAKBANK.NS'
}

text_replacements = {
    'Tech earnings': 'IT earnings',
    'Technology': 'IT',
    'Wall Street': 'Dalal Street',
    'Nasdaq': 'NSE'
}

for directory in directories_to_scan:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                original_content = content
                
                # Replace Tickers
                for us_tick, in_tick in ticker_replacements.items():
                    # Replace exact whole words to avoid partial matches
                    content = re.sub(rf'\b{re.escape(us_tick)}\b', in_tick, content)

                # Replace Text
                for key, val in text_replacements.items():
                    content = content.replace(key, val)

                # Replace $ with ₹ in JSX text and string literals
                content = content.replace('$', '₹')

                # Restore any mistakenly replaced system variables like ${}
                content = content.replace('₹{', '${')
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {filepath}")
