import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_cover_letter(job_description: str, resume: str) -> str:
    """
    Generate a personalized cover letter using OpenAI's GPT model.
    """
    prompt = f"""
    Using the job description and resume provided below, generate a professional and personalized cover letter.
    The cover letter should highlight relevant experience and skills from the resume that match the job requirements.
    Make it concise, engaging, and professional.

    Job Description:
    {job_description}

    Resume:
    {resume}

    Generate a cover letter that:
    1. Opens with a strong introduction
    2. Highlights relevant experience and skills
    3. Shows enthusiasm for the role and company
    4. Closes professionally
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional cover letter writer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        raise Exception(f"Error generating cover letter: {str(e)}") 