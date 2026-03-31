const token = process.env.VERCEL_OIDC_TOKEN;
if (!token) {
  console.log("❌ VERCEL_OIDC_TOKEN está undefined ou vazio");
  process.exit(1);
}
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
console.log("✅ PAYLOAD DO TOKEN:");
console.log(JSON.stringify(payload, null, 2));
