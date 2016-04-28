FROM daocloud.io/python:2.7.11
ADD . /app
WORKDIR /app
RUN pip install -r requirements.txt --upgrade
EXPOSE 5000
ENV MODE DEVELOPMENT

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]