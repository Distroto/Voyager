import os
import openai
from dotenv import load_dotenv

print("--- Starting OpenAI Connection Test ---")
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ ERROR: OPENAI_API_KEY environment variable not found.")
else:
    print(f"✅ Found API Key starting with: {api_key[:5]}")

openai.api_key = api_key

try:
    print("Attempting to connect to OpenAI to list models...")
    # A simple, low-cost API call to test connectivity
    models = openai.models.list()
    print("✅ SUCCESS! Successfully connected to OpenAI and received a response.")
    print(f"Found model: {models.data[0].id}")

except Exception as e:
    print("\n" + "="*30)
    print("❌ FAILED TO CONNECT TO OPENAI")
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Details: {e}")
    print("="*30 + "\n")