import os
import google.generativeai as genai
import json

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

def get_gemini_response(history, user_message):
    """
    Standard Chat Assistant Logic
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')
        
        # Simple history formatting
        chat_session = model.start_chat(
            history=[
                {"role": "user" if msg["sender"] == "user" else "model", "parts": [msg["text"]]}
                for msg in history
            ]
        )
        
        response = chat_session.send_message(user_message)
        return response.text
    except Exception as e:
        return f"Error connecting to AI: {str(e)}"

def generate_pipeline_plan(user_prompt):
    """
    Generates React Flow JSON from natural language.
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')
        
        system_instruction = """
        You are a Data Pipeline Architect for StreamForge. 
        Your goal is to convert natural language requests into a strictly formatted JSON object representing a React Flow graph.
        
        ### AVAILABLE NODE TYPES:
        1. Sources: 'source_csv', 'source_json', 'source_excel' (Data: {filename: 'name.ext'})
        2. Transforms:
           - 'filterNode' (Data: {column: 'col', condition: '>', value: 'val'})
           - 'trans_sort' (Data: {column: 'col', order: 'true'/'false'})
           - 'trans_select' (Data: {columns: 'col1, col2'})
           - 'trans_rename' (Data: {oldName: 'old', newName: 'new'})
           - 'trans_dedupe' (Data: {})
           - 'trans_fillna' (Data: {column: 'col', value: 'val'})
           - 'trans_group' (Data: {groupCol: 'col', targetCol: 'col', operation: 'sum'/'mean'})
           - 'trans_join' (Data: {key: 'id', how: 'inner'})
           - 'trans_limit' (Data: {limit: 100})
           - 'trans_calc' (Data: {colA, colB, op: '+', newCol})
        3. Visuals: 'vis_chart' (Data: {chartType: 'bar', x_col, y_col, outputName})
        4. Destinations: 'dest_csv', 'dest_json', 'dest_db' (Data: {outputName: 'name'})

        ### RULES:
        1. Return ONLY raw JSON. No markdown, no explanations.
        2. Layout: Calculate 'position': { 'x': 0, 'y': 0 } for the first node, and increment 'x' by 300 for each subsequent node. Keep 'y' constant at 100.
        3. IDs: Use simple strings like '1', '2', '3'.
        4. Edges: Connect nodes sequentially (1->2, 2->3) unless implied otherwise.

        ### REQUIRED OUTPUT FORMAT:
        {
            "nodes": [
                { "id": "1", "type": "source_csv", "position": { "x": 0, "y": 100 }, "data": { "label": "Source CSV", "filename": "data.csv" } }
            ],
            "edges": [
                { "id": "e1-2", "source": "1", "target": "2" }
            ]
        }
        """

        full_prompt = f"{system_instruction}\n\nUSER REQUEST: {user_prompt}\n\nJSON:"
        
        response = model.generate_content(full_prompt)
        
        # Clean response (remove markdown code blocks if AI adds them)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text)

    except Exception as e:
        print(f"AI Gen Error: {e}")
        return {"error": str(e)}