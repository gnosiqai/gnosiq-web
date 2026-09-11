import type { Metadata } from 'next'
import Link from 'next/link'
import {
  COMPANY_LEGAL_NAME,
  COMPANY_CNPJ,
  COMPANY_ADDRESS_LINE1,
  COMPANY_ADDRESS_LINE2_PT,
  COMPANY_EMAIL,
  COMPANY_URL,
} from '@/lib/constants/company'

export const metadata: Metadata = {
  title: 'Termos de Uso | GnosIQ',
  description: 'Termos e condições de uso da plataforma GnosIQ. Conformidade LGPD e CDC.',
  robots: 'index, follow',
}

// 1.0 -> 1.1. A cláusula 3 listava só e-mail na lista de espera;
// a LP v2 coleta WhatsApp. Mesmo princípio da Política de Privacidade —
// documento legal que muda de conteúdo tem que mudar de carimbo.
// 1.1 -> 1.2. Nova cláusula 5 "Condições de Fundador" (pacote aprovado pelo
// founder e ratificado pelo RISK) e controlador atualizado para a razão social
// e a sede fiscal da empresa. As cláusulas seguintes foram renumeradas.
// 1.2 -> 1.2.1. Cláusula 7: foro da comarca da sede (Porto Alegre) com a
// ressalva do foro do domicílio do consumidor; eleição exclusiva removida.
const TERMS_VERSION = '1.2.1'
const TERMS_DATE = '11 de setembro de 2026'

export default function TermsPage() {
  return (
    <main
      style={{
        background: '#0D0B1E',
        minHeight: '100vh',
        padding: '4rem 1.5rem',
        fontFamily: 'Inter, sans-serif',
        color: '#D1D5DB',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <Link
            href="/"
            style={{
              color: '#8B5CF6',
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'inline-block',
              marginBottom: '2rem',
            }}
          >
            ← Voltar para gnosiq.ai
          </Link>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '0.5rem',
            }}
          >
            Termos de Uso
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            GnosIQ · v{TERMS_VERSION} · Vigência: {TERMS_DATE}
          </p>
        </div>

        {/* Cláusula 1 — Definição do serviço */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            1. Definição do Serviço
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
            A GnosIQ oferece uma plataforma de <strong style={{ color: '#FFFFFF' }}>avaliação cognitiva</strong> baseada
            em instrumentos psicométricos validados e processamento por inteligência artificial. O produto principal
            consiste em um questionário adaptativo e um relatório de perfil cognitivo individual.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            O serviço da GnosIQ é uma <strong style={{ color: '#FFFFFF' }}>ferramenta de autoconhecimento</strong> e
            desenvolvimento pessoal. Ele <strong style={{ color: '#FFFFFF' }}>não constitui diagnóstico clínico</strong>,
            avaliação médica, psicológica ou neurológica, e não substitui consulta com profissional de saúde habilitado.
          </p>
        </div>

        {/* Cláusula 2 — Disclaimer CFP */}
        <div
          style={{
            marginBottom: '2.5rem',
            background: 'rgba(139, 92, 246, 0.06)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            2. Aviso Importante: Limitações do Serviço
          </h2>
          <p style={{ lineHeight: 1.7, fontStyle: 'italic' }}>
            A avaliação cognitiva da GnosIQ <strong style={{ color: '#FFFFFF' }}>não substitui avaliação clínica
            ou diagnóstico profissional</strong>. Os resultados têm finalidade exclusivamente informativa e de
            desenvolvimento pessoal. Caso você apresente sintomas de transtornos cognitivos, emocionais ou
            psicológicos, consulte um profissional de saúde qualificado (psicólogo, psiquiatra ou neurologista).
          </p>
        </div>

        {/* Cláusula 3 — Dados coletados e LGPD */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            3. Dados Coletados e Base Legal (LGPD)
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
            O tratamento de dados pessoais pela GnosIQ é realizado com base no{' '}
            <strong style={{ color: '#FFFFFF' }}>consentimento do titular</strong> (Lei 13.709/2018 - LGPD,
            Art. 7º, inciso I). Os dados coletados incluem:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
            <li>
              <strong style={{ color: '#FFFFFF' }}>Lista de espera:</strong> endereço de e-mail e/ou número de
              WhatsApp (pelo menos um, fornecido por você) e, opcionalmente, o papel profissional, para
              comunicação sobre o acesso antecipado ao beta e as condições de fundador.
            </li>
            <li>
              <strong style={{ color: '#FFFFFF' }}>Avaliação cognitiva:</strong> respostas ao questionário,
              utilizadas exclusivamente para geração do relatório individual. Não são compartilhadas com terceiros
              e não são utilizadas para treinar modelos de inteligência artificial externos.
            </li>
            <li>
              <strong style={{ color: '#FFFFFF' }}>Dados de uso:</strong> informações de navegação anonimizadas
              (via PostHog), para melhoria da plataforma.
            </li>
          </ul>
          <p style={{ lineHeight: 1.7, marginTop: '1rem' }}>
            Você pode revogar seu consentimento a qualquer momento enviando e-mail para{' '}
            <a href="mailto:hello@gnosiq.ai" style={{ color: '#8B5CF6' }}>
              hello@gnosiq.ai
            </a>{' '}
            com o assunto <strong style={{ color: '#FFFFFF' }}>&ldquo;LGPD - Revogar Consentimento&rdquo;</strong>.
          </p>
        </div>

        {/* Cláusula 4 — Política de reembolso */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            4. Política de Reembolso
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
            Em conformidade com o{' '}
            <strong style={{ color: '#FFFFFF' }}>Código de Defesa do Consumidor (CDC), Art. 49</strong>, o
            usuário que adquirir o serviço por meio eletrônico tem direito ao arrependimento e reembolso integral
            em até <strong style={{ color: '#FFFFFF' }}>7 (sete) dias corridos</strong> a partir da data da compra,
            independentemente de justificativa.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            Para solicitar reembolso, envie e-mail para{' '}
            <a href="mailto:hello@gnosiq.ai" style={{ color: '#8B5CF6' }}>
              hello@gnosiq.ai
            </a>{' '}
            com o assunto <strong style={{ color: '#FFFFFF' }}>&ldquo;Reembolso - [seu pedido]&rdquo;</strong>. O valor será
            estornado em até 5 dias úteis.
          </p>
        </div>

        {/* Cláusula 5 — Condições de Fundador */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            5. Condições de Fundador
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
            Os <strong style={{ color: '#FFFFFF' }}>100 (cem) primeiros inscritos</strong> na lista de espera da GnosIQ
            (os &ldquo;Fundadores&rdquo;) fazem jus às condições abaixo, nos termos desta cláusula.
          </p>
          <ol style={{ paddingLeft: '1.5rem', lineHeight: 1.7 }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFFFFF' }}>Preço travado.</strong> O preço da avaliação cognitiva individual
              fica travado em <strong style={{ color: '#FFFFFF' }}>R$97 (noventa e sete reais)</strong> para o Fundador. A condição
              é pessoal e intransferível, vinculada ao endereço de e-mail inscrito na lista de espera, e
              não alcança outros produtos, planos, tiers, upgrades ou serviços adicionais que a GnosIQ venha
              a oferecer (lista exemplificativa).
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFFFFF' }}>Vigência.</strong> A condição vigora enquanto o serviço de avaliação
              cognitiva individual for oferecido pela GnosIQ e a conta do Fundador for mantida ativa.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFFFFF' }}>Reavaliação gratuita.</strong> O Fundador tem direito a 1 (uma)
              reavaliação gratuita, exercível do 6º (sexto) ao 9º (nono) mês contados da conclusão da
              primeira avaliação, pelo fluxo disponível no produto. O direito não é cumulativo, não é
              transferível e não é conversível em crédito, desconto ou qualquer outro valor.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFFFFF' }}>Critério dos 100 primeiros.</strong> A ordem é definida pela data e
              hora de inscrição na lista de espera, conforme o registro de criação mantido pela GnosIQ,
              considerando uma inscrição por endereço de e-mail. Em caso de inscrições duplicadas, prevalece
              a primeira. A condição de Fundador é confirmada no lançamento do serviço.
            </li>
            <li>
              <strong style={{ color: '#FFFFFF' }}>Sem compromisso de data e sem cobrança antecipada.</strong> A inscrição
              na lista de espera é gratuita e não gera obrigação de compra. A GnosIQ não assume compromisso
              de data de lançamento, e nenhum valor é cobrado antes da disponibilização do serviço ao
              Fundador.
            </li>
          </ol>
        </div>

        {/* Cláusula 6 — Limitação de Responsabilidade */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            6. Limitação de Responsabilidade
          </h2>
          <p style={{ lineHeight: 1.7 }}>
            Os relatórios GnosIQ são instrumentos de autoconhecimento e desenvolvimento.
            Não substituem avaliação clínica, diagnóstico psicológico ou psiquiátrico,
            nem devem ser usados como base para decisões médicas ou jurídicas.
          </p>
        </div>

        {/* Cláusula 7 — Jurisdição */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            7. Jurisdição e Foro
          </h2>
          <p style={{ lineHeight: 1.7 }}>
            Estes Termos são regidos pelas leis da{' '}
            <strong style={{ color: '#FFFFFF' }}>República Federativa do Brasil</strong>. Para as controvérsias
            decorrentes destes Termos, fica eleito o foro da comarca de{' '}
            <strong style={{ color: '#FFFFFF' }}>Porto Alegre, Estado do Rio Grande do Sul</strong>, ressalvado, nas
            relações de consumo, o direito do consumidor de optar pelo foro do seu próprio domicílio, nos termos da
            legislação aplicável.
          </p>
        </div>

        {/* Cláusula 8 — Controlador dos dados */}
        <div style={{ marginBottom: '3rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            8. Controlador dos Dados e Contato
          </h2>
          <p style={{ lineHeight: 1.7 }}>
            O controlador dos dados pessoais tratados pela GnosIQ é:
          </p>
          <div
            style={{
              marginTop: '1rem',
              padding: '1.25rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)',
              lineHeight: 2,
            }}
          >
            <strong style={{ color: '#FFFFFF' }}>{COMPANY_LEGAL_NAME}</strong>
            <br />
            {`CNPJ ${COMPANY_CNPJ}`}
            <br />
            {COMPANY_ADDRESS_LINE1}
            <br />
            {COMPANY_ADDRESS_LINE2_PT}
            <br />
            <a href={`mailto:${COMPANY_EMAIL}`} style={{ color: '#8B5CF6' }}>
              {COMPANY_EMAIL}
            </a>{' '}
            ·{' '}
            <a href={COMPANY_URL} style={{ color: '#8B5CF6' }}>
              gnosiq.ai
            </a>
          </div>
        </div>

        {/* Links legais */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginBottom: '2rem',
            fontSize: '0.875rem',
          }}
        >
          <a href="/privacy" style={{ color: '#8B5CF6', textDecoration: 'none' }}>
            Política de Privacidade
          </a>
          <a href="/terms" style={{ color: '#8B5CF6', textDecoration: 'none' }}>
            Termos de Uso
          </a>
        </div>

        {/* Footer */}
        <hr style={{ borderColor: '#1F1B3A', margin: '3rem 0' }} />
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6B7280' }}>
          GnosIQ © 2026 · v{TERMS_VERSION} · LGPD compliant
        </p>
      </div>
    </main>
  )
}
