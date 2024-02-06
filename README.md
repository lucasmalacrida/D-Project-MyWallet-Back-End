# MyWallet API

Back-end for MyWallet, a website for a virtual wallet.

## About

MyWallet is a web browser application where you can save and visualize the transactions of your wallet, that is, your cash flow.
Link to the deployed API : https://mywallet-api-475x.onrender.com

## How to run for development

1. Clone this repository
2. Install all dependencies

```bash
npm i
```

3. Create a MongoDB database with whatever name you want
4. Configure the `.env.development` file using the `.env.example` file

5. Run the back-end in a development environment:

```bash
npm run dev
```

## Building and starting for production

```bash
npm start
```
## What to do when add new ENV VARIABLES

There are several things you need to do when you add new ENV VARIABLES:
- Add them to `.env.example` file
- Add them to your local `.env.development` and `.env.test` files