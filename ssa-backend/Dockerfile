FROM python:slim

WORKDIR /app
ADD requirements.txt /app
RUN apt update && apt install libmariadb-dev build-essential -y && \
 pip install --no-cache-dir -r requirements.txt

ADD . /app

CMD ["python3", "app.py"]