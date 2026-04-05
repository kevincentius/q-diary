npx nx build server
npx nx build client
cp server/dist/main.js src-tauri/resources/server/
npx tauri build
