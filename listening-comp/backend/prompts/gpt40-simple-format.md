# Simplified Prompt for OpenAI GPT-4o

## **Instruction:**  
Transform Japanese listening comprehension transcripts into structured `<question>` elements using the exact text from the source.

## **Guidelines:**  
- **Input:** Japanese listening comprehension transcript  
- **Output:** Individual `<question>` elements with:
   - **Introduction:** Setting and participants (exact from input)
   - **Conversation:** Exact conversation text
   - **Question:** Extracted main question
- **Format:**
   - Wrap each question in `<question>` tags with no parent elements.
   - Use capitalized section labels followed by a colon: `Introduction:`, `Conversation:`, `Question:`
   - Text must be taken verbatim from the source.

- **Spatial Restrictions:**
   - Exclude questions with spatial references (left, right, above, below, behind, next to, etc.)
   - No directional references (north, south, east, west)
   - No map, diagram, or location-based questions

## **Example:**
```xml
<question>
Introduction: 朝会の練習でN5の試験模試をしている

Conversation: 朝会これからN5の懲戒試験を始めますメモを取ってもいいです問題用紙を開けてください問題1問題1では初めに質問を聞いてくださいそれから話を聞いて問題用紙の1から4の中から1番いいものを1つ選んでくださいでは練習しましょう例家で女の人が男の人と話しています女の人は男の人に何を出しますか今日は寒いですね温かいものを飲みませんかありがとうございませんコーヒー紅茶あとお茶もありますですけどじゃあ紅茶をお願いします砂糖やミルクは入れますかはい

Question: 女の人は男の人に何を出しますか
</question>
```

## **Process:**  
1. **Identify:** Break the source into individual questions.  
2. **Extract:** Copy introduction, conversation, and question exactly from the source.  
3. **Filter:** Exclude questions with spatial or directional references.  
4. **Format:** Output each question using the provided structure.

## **Verification:**  
- Ensure each `<question>` element has Introduction, Conversation, and Question.
- Verify that the text is copied verbatim from the source.
- Confirm no spatial or directional references are included.
