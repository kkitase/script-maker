<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Script Maker

このプロジェクトは、Gemini API を使用してスクリプトを生成したり、Google スライドのノートからスクリプトを抽出したりするための Web アプリケーションです。

## 主な機能

*   **スクリプト生成:** Gemini API を活用して、様々な種類のスクリプトを生成します。
*   **スライドからスクリプトを抽出:** Google Apps Script (GAS) を利用して、指定した Google スライドの各スライドのノート欄からテキストを抽出し、一つのスクリプトとしてまとめます。

## アーキテクチャ

このアプリケーションは、主にクライアントサイドの React アプリケーションと、Google スライドを操作するための Google Apps Script で構成されています。

```mermaid
graph TD;
    A[React フロントエンド<br>(ユーザーのブラウザ)] --> B[Google Apps Script (GAS)<br>(Google 上でホスト)];
    B --> C[Google スライド<br>(対象のプレゼンテーション)];
```

1.  ユーザーが React アプリケーション上で Google スライドの URL を指定します。
2.  React アプリケーションが Google Apps Script の関数を呼び出します。
3.  Google Apps Script が Google Slides API を通じて、指定されたスライドのノートを読み取ります。
4.  抽出されたテキストが React アプリケーションに返され、ユーザーに表示されます。

## ローカルで実行する

**前提条件:** Node.js

1.  **依存関係をインストールします:**
    ```bash
    npm install
    ```

2.  **環境変数を設定します:**

    プロジェクトのルートに `.env.local` という名前の新しいファイルを作成し、Gemini API キーを追加します。
    ```
    GEMINI_API_KEY=YOUR_API_KEY
    ```
    `YOUR_API_KEY` を実際の Gemini API キーに置き換えてください。

3.  **Google Apps Script を設定します:**
    *   Google Apps Script プロジェクトを作成します。
    *   `Code.gs` に指定のコードをコピーします。
    *   ウェブアプリとしてデプロイします。
    
    *(注: 詳細な GAS の設定手順については、別途ドキュメントが必要です)*

4.  **アプリケーションを実行します:**
    ```bash
    npm run dev
    ```

    ブラウザを開き、Vite から提供された URL (通常は `http://localhost:5173`) に移動します。
