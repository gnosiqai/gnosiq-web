import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
 /*
      chaves de TESTE oficiais da Cloudflare, verbatim da doc
      (developers.cloudflare.com/turnstile/troubleshooting/testing/):

        1x00000000000000000000AA            sitekey "always passes"
        1x0000000000000000000000000000000AA secret  "always passes"

      Ficam aqui, e não em cada arquivo, porque são CONFIGURAÇÃO de ambiente,
      não fixture de caso: qualquer teste que renderize a LP inteira precisa
      da sitekey para o formulário não cair no indisponibilidade do cliente.

      A secret real NUNCA entra em CI nem em código: ela existe só como env
      Secret do Vercel. Os testes que exercitam o siteverify mockam a rede, e
      os que exercitam ausência de env limpam a variável explicitamente.
 */
    env: {
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
      TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
 /*
        config de e-mail. Valores obviamente falsos: o SDK do Resend
        é mockado em toda a suite, nenhum e-mail sai daqui, e a key real vive
        só como env Secret do Vercel. Ficam aqui porque o módulo falha rápido
        quando faltam, e falhar por env ausente é o que os testes DEDICADOS a
        isso devem provar, não um efeito colateral de todos os outros.
 */
      RESEND_API_KEY: 're_test_key_nao_e_real',
      EMAIL_FROM: 'hello@gnosiq.ai',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
})
