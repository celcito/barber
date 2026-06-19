# Regras do Projeto

## SDKs com Web APIs (Resend, etc.)

Nunca instanciar SDKs que usam Web APIs (`Headers`, `Request`, `Response`) em **module scope**. Isso quebra o build no Vercel (runtime Node.js serverless).

**Certo:**
```ts
export async function sendEmail(...) {
  if (env guard) return;
  const resend = new Resend(apiKey); // dentro da função, após guards
  await resend.emails.send(...);
}
```

**Errado:**
```ts
const resend = new Resend(process.env.API_KEY); // module scope — quebra no Vercel
```

## Regra geral

TODO instanciação de clientes HTTP/externos que dependam de Web APIs deve ser feita **dentro da função**, nunca fora.
