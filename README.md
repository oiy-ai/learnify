> ⚠️This repository is still in development.⚠️



# Welcome to Learnify! 🎓
[![Image](https://github.com/user-attachments/assets/f31894ba-72ef-406f-9583-14dbf899e37e)](https://learnify.oiy.ai/)


Learnify is your AI-powered learning companion that helps you master new knowledge faster and more effectively. Transform any learning material into interactive study tools with the power of AI.



🌐Website: https://learnify.oiy.ai/

## ✨ Key Features
📕 Material Management

📗Upload, Preview, Download study materials

📘Supports various file types for flexible learning

## 🤖 AI-Powered Learning
· AI-Generated Notes from your materials

· Mind Maps for visualizing key concepts

· Flashcards for quick recall and spaced repetition

· AI Chat for interactive Q&A, study assistance, and explanations

· ChatGPT Study Mode with RAG (Retrieval-Augmented Generation) and embeddings for context-aware responses



















# run the frontend

## 1. install yarn(if you haven't)

```
npm i -g yarn
```

> you can check your installation by `yarn -v`

## 2. install dependencies

```
yarn
```

> notice if there is any error during installation.

## 3. run the frontend service

```
yarn run dev
```

if everything works fine, it'll show like this:

![](https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250424201451791.png)

choose `@affine/web`

there'll be some basic information showed in terminal:

![](https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250424201606399.png)

## 4. open localhost:8080 in browser

it'll show some error like this:

![](https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250424202710918.png)

It's ok. It'll be solved as we run the backend service correctly.

# run the backend

## 1. install PostgresSQL and Redis

- go to this path: `/.docker/dev`
- copy `.env.example` and rename it as `.env`
- change database connection information in `.env`
- copy `compose.yml.example` and rename it as `compose.yml`
- run `docker compose -f ./.docker/dev/compose.yml up -d` to start those two containers
  ![](https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250424201924290.png)
- after that, you can check your docker container by `docker ps`, you'll see two processes as follow:
  ![](https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250424204103397.png)

## 2. check database connection

You can use any tools to do the connection test, for this document, we'll use TablePlus:

1. open TablePlus, create a connection:

![](https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250424204309572.png)

2. input connection information as in the `.env` file

![](https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250424204759368.png)

It'll turn green if the connection working fine.

## 3. data initialization

- go to this path: `/packages/backend/server`
- copy `.env.example` and rename it as `.env`
- As for now, only `DATABASE_URL` should be clarified
- back to root path, run the command below to initialize the database:
  ```sh
  yarn affine server init
  ```
- after that, you'll see tables and functions in database:
  ![](https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250424205552195.png)

## 4. run the backend service

```
yarn run dev
```

if everything works fine, it'll show like this:

![](https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250424201451791.png)

choose `@affine/server`

there'll be some server logs showed in terminal:

![](https://cdn.jsdelivr.net/gh/a1exsun/file@main//hexo/20250424205750753.png)

# More Tips

## 1. affline CLI

- see helper:

  ```bash
  yarn affine -h
  ```

- run service in dev mode:

  ```bash
  yarn affine web/mobile/admin dev
  ```
