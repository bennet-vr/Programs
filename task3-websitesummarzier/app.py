
from flask import Flask, render_template, request
import requests
import socket
import ipaddress
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from summarizer import summarize_text

app = Flask(__name__)


def validate_url(url):
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only HTTP and HTTPS websites are supported.")

    if not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("Invalid website URL.")

    if parsed.port and parsed.port not in (80, 443):
        raise ValueError("This port is not supported.")

    hostname = parsed.hostname.lower()

    if hostname == "localhost" or hostname.endswith(".local"):
        raise ValueError("Local websites are not allowed.")

    try:
        addresses = socket.getaddrinfo(hostname, None)
        for address in addresses:
            ip = ipaddress.ip_address(address[4][0])
            if not ip.is_global:
                raise ValueError("Private or local addresses are not allowed.")
    except socket.gaierror:
        raise ValueError("Unable to find this website.")

    return url


def extract_website_text(url):
    headers = {"User-Agent": "Mozilla/5.0"}

    response = requests.get(
        url,
        headers=headers,
        timeout=15,
        allow_redirects=False
    )

    if 300 <= response.status_code < 400:
        raise ValueError("This website redirects to another address.")

    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for element in soup(["script", "style", "nav", "footer", "header"]):
        element.decompose()

    return soup.get_text(separator=" ", strip=True)


@app.route("/", methods=["GET", "POST"])
def home():
    summary = None
    error = None
    website_url = ""

    if request.method == "POST":
        website_url = request.form.get("url", "").strip()

        try:
            if not website_url:
                raise ValueError("Please enter a website URL.")

            website_url = validate_url(website_url)
            text = extract_website_text(website_url)

            if len(text) < 100:
                error = "Not enough text found on this website."
            else:
                summary = summarize_text(text)

        except ValueError as e:
            error = str(e)
        except requests.exceptions.RequestException:
            error = "Unable to access this website. Please check the URL."
        except Exception:
            error = "Something went wrong while summarizing the website."

    return render_template(
        "index.html",
        summary=summary,
        error=error,
        website_url=website_url
    )


if __name__ == "__main__":
    app.run(debug=False)
