
# Website Summarizer

A simple web application that extracts the main text content from a website and generates a short summary.

## Features

- Accepts a website URL as input.
- Extracts readable text from webpages.
- Removes unnecessary elements such as navigation bars and scripts.
- Generates a summary using word-frequency-based sentence scoring.
- Displays the summary through a simple web interface.
- Handles invalid URLs and website access errors.

## Technologies Used

- Python
- Flask
- Requests
- BeautifulSoup
- HTML
- CSS

## Project Structure

```text
Task3_Website_Summarizer/
├── app.py
├── summarizer.py
├── requirements.txt
├── README.md
├── .gitignore
└── templates/
    └── index.html
```

## Installation and Setup

1. Clone the repository.

```bash
git clone https://github.com/bennet-vr/programs.git
```

2. Navigate to the project folder.

```bash
cd programs/Task3_Website_Summarizer
```

3. Create a virtual environment.

```bash
python -m venv venv
```

4. Activate the virtual environment.

Windows Command Prompt:

```cmd
venv\Scripts\activate
```

5. Install dependencies.

```bash
pip install -r requirements.txt
```

6. Run the application.

```bash
python app.py
```

7. Open the application in your browser:

```text
http://127.0.0.1:5000
```

## How It Works

1. The user enters a website URL.
2. The application retrieves the webpage using Requests.
3. BeautifulSoup extracts the readable text.
4. The summarization module calculates word frequencies.
5. Important sentences are selected and arranged in their original order.
6. The generated summary is displayed on the webpage.

## Limitations

- Some websites block automated requests.
- Websites that load content using JavaScript may not work correctly.
- The summarizer uses extractive summarization rather than an AI language model.
