import type { Metadata } from 'next';
import Link from 'next/link';
import { PRIVACY_POLICY_VERSION, PRIVACY_POLICY_DATE } from '@/lib/constants/legal';

export const metadata: Metadata = {
  title: 'Política de Privacidade | GnosIQ',
  description: 'Como a GnosIQ coleta, usa e protege seus dados. Conformidade LGPD.',
  robots: { index: true, follow: true },
};

// GNO-115: versão e data vêm de lib/constants/legal.ts, que declara a regra
// DRY. Estavam duplicadas aqui e podiam divergir do SSOT sem ninguém notar.
const PRIVACY_VERSION = PRIVACY_POLICY_VERSION;
const PRIVACY_DATE = PRIVACY_POLICY_DATE;

export default function PrivacyPage() {
  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: '#0D0B1E', color: '#ffffff' }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm mb-8 inline-block"
            style={{ color: '#8B5CF6' }}
          >
            ← Voltar para GnosIQ
          </Link>
          <h1 className="text-3xl font-bold mt-6 mb-2">
            Política de Privacidade
          </h1>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Versão {PRIVACY_VERSION} · Última atualização: {PRIVACY_DATE}
          </p>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Privacy Policy · <a href="#en" style={{ color: '#8B5CF6' }}>English version below</a>
          </p>
        </div>

        <hr style={{ borderColor: '#1F1B3A', marginBottom: '3rem' }} />

        {/* PT-BR */}
        <section className="space-y-10">

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              1. Dados Coletados
            </h2>
            <p className="leading-relaxed" style={{ color: '#D1D5DB' }}>
              <strong>Lista de espera:</strong> coletamos o seu endereço de e-mail e/ou número de
              WhatsApp (pelo menos um, fornecido por você) e, opcionalmente, o seu papel
              profissional. <strong>Finalidade:</strong> comunicação sobre o acesso antecipado ao
              beta e as condições de fundador. <strong>Base legal:</strong> consentimento (art. 7º,
              I, LGPD). Você pode solicitar a exclusão desses dados a qualquer momento pelo e-mail{' '}
              <a href="mailto:hello@gnosiq.ai" style={{ color: '#8B5CF6' }}>
                hello@gnosiq.ai
              </a>
              {'.'}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              2. Uso dos Dados
            </h2>
            <ul className="space-y-2" style={{ color: '#D1D5DB' }}>
              <li>✦ Comunicar o lançamento oficial da plataforma GnosIQ</li>
              <li>✦ Enviar atualizações relevantes sobre o produto (com opção de descadastro)</li>
              <li>✦ Nunca vender, compartilhar ou usar para treinar modelos de IA externos</li>
              <li>✦ Nunca utilizar para finalidade diversa da comunicação de lançamento</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              3. Avaliações Cognitivas
            </h2>
            <p className="leading-relaxed" style={{ color: '#D1D5DB' }}>
              Os resultados de avaliações cognitivas realizadas pela plataforma são{' '}
              <strong>estritamente confidenciais</strong> e permanecem sob controle exclusivo do
              usuário. Esses dados <strong>nunca saem do perímetro GnosIQ</strong>, não são
              compartilhados com terceiros e não são utilizados para treinar modelos de linguagem
              externos. Os relatórios gerados <strong>não substituem diagnóstico clínico</strong>{' '}
              e não têm validade médica ou psicológica oficial.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              4. Compartilhamento com Terceiros
            </h2>
            <p className="mb-3 leading-relaxed" style={{ color: '#D1D5DB' }}>
              Para operar o serviço, a GnosIQ utiliza os seguintes sub-processadores de dados,
              todos operando sob acordos de confidencialidade e em conformidade com a LGPD:
            </p>
            <ul className="space-y-2" style={{ color: '#D1D5DB' }}>
              <li>✦ <strong>PostHog</strong> — analytics de uso (dados pseudonimizados; sem PII exposta)</li>
              <li>✦ <strong>SendGrid / Resend</strong> — envio de e-mail transacional (confirmação de cadastro e comunicações de lançamento)</li>
            </ul>
            <p className="mt-3 leading-relaxed" style={{ color: '#D1D5DB' }}>
              Nenhum dado pessoal é vendido ou compartilhado com terceiros para fins comerciais
              ou publicitários.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              5. Seus Direitos (LGPD — Lei nº 13.709/2018)
            </h2>
            <p className="mb-3" style={{ color: '#D1D5DB' }}>
              Nos termos da Lei Geral de Proteção de Dados Pessoais, você tem direito a:
            </p>
            <ul className="space-y-2" style={{ color: '#D1D5DB' }}>
              <li>✦ <strong>Acesso</strong> — saber quais dados temos sobre você</li>
              <li>✦ <strong>Correção</strong> — atualizar dados incorretos ou desatualizados</li>
              <li>✦ <strong>Exclusão</strong> — solicitar a remoção completa dos seus dados</li>
              <li>✦ <strong>Portabilidade</strong> — receber seus dados em formato estruturado</li>
              <li>✦ <strong>Revogação</strong> — cancelar o consentimento a qualquer momento</li>
            </ul>
            <p className="mt-4" style={{ color: '#D1D5DB' }}>
              Para exercer qualquer direito, envie um e-mail para{' '}
              <a href="mailto:hello@gnosiq.ai" style={{ color: '#8B5CF6' }}>
                hello@gnosiq.ai
              </a>{' '}
              com o assunto <strong>&quot;LGPD — [seu direito]&quot;</strong>. Respondemos em até 15 dias
              úteis.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              6. Contato e Controlador de Dados
            </h2>
            <p style={{ color: '#D1D5DB' }}>
              <strong>GnosIQ</strong> · CNPJ 66.473.762/0001-13 · São Paulo, SP — Brasil
              <br />
              Responsável pelo tratamento de dados: Carlos Alberto Gomes
              <br />
              E-mail:{' '}
              <a href="mailto:hello@gnosiq.ai" style={{ color: '#8B5CF6' }}>
                hello@gnosiq.ai
              </a>
              <br />
              Site:{' '}
              <a href="https://gnosiq.ai" style={{ color: '#8B5CF6' }}>
                gnosiq.ai
              </a>
            </p>
          </div>

        </section>

        <hr style={{ borderColor: '#1F1B3A', margin: '3rem 0' }} />

        {/* EN */}
        <section id="en" className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold mb-1">Privacy Policy</h2>
            <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>
              Version {PRIVACY_VERSION} · Last updated: {PRIVACY_DATE}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              1. Data Collected
            </h3>
            <p style={{ color: '#D1D5DB' }}>
              <strong>Waiting list:</strong> we collect your e-mail address and/or WhatsApp number
              (at least one, provided by you) and, optionally, your professional role.{' '}
              <strong>Purpose:</strong> communication about early access to the beta and the founder
              conditions. <strong>Legal basis:</strong> consent (art. 7(I) of the LGPD, the
              Brazilian data protection law). You may request deletion of this data at any time by
              e-mailing{' '}
              <a href="mailto:hello@gnosiq.ai" style={{ color: '#8B5CF6' }}>
                hello@gnosiq.ai
              </a>
              {'.'}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              2. Use of Data
            </h3>
            <ul className="space-y-2" style={{ color: '#D1D5DB' }}>
              <li>✦ Communicate the official GnosIQ launch</li>
              <li>✦ Send relevant product updates (with unsubscribe option)</li>
              <li>✦ Never sold, shared, or used to train external AI models</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              3. Cognitive Assessments
            </h3>
            <p style={{ color: '#D1D5DB' }}>
              Assessment results are <strong>strictly confidential</strong>, never leave the
              GnosIQ perimeter, and are not shared with any third party. Reports{' '}
              <strong>do not replace clinical diagnosis</strong> and have no official medical
              validity.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              4. Your Rights (LGPD / GDPR)
            </h3>
            <p style={{ color: '#D1D5DB' }}>
              You have the right to access, correct, delete, or port your data, and to revoke
              consent at any time. Email{' '}
              <a href="mailto:hello@gnosiq.ai" style={{ color: '#8B5CF6' }}>
                hello@gnosiq.ai
              </a>{' '}
              with subject <strong>&quot;Privacy — [your request]&quot;</strong>. Response within 15
              business days.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#8B5CF6' }}>
              5. Contact
            </h3>
            <p style={{ color: '#D1D5DB' }}>
              <strong>GnosIQ</strong> · São Paulo, SP — Brazil
              <br />
              Data Controller: Carlos Alberto Gomes
              <br />
              <a href="mailto:hello@gnosiq.ai" style={{ color: '#8B5CF6' }}>
                hello@gnosiq.ai
              </a>{' '}
              ·{' '}
              <a href="https://gnosiq.ai" style={{ color: '#8B5CF6' }}>
                gnosiq.ai
              </a>
            </p>
          </div>
        </section>

        <hr style={{ borderColor: '#1F1B3A', margin: '3rem 0' }} />

        <p className="text-xs text-center" style={{ color: '#6B7280' }}>
          GnosIQ © {new Date().getFullYear()} · v{PRIVACY_VERSION} · LGPD compliant
        </p>

      </div>
    </main>
  );
}
