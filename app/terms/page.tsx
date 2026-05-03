import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso | GnosIQ',
  description: 'Termos e condições de uso da plataforma GnosIQ. Conformidade LGPD e CDC.',
  robots: 'index, follow',
}

const TERMS_VERSION = '1.0'
const TERMS_DATE = '29 de abril de 2026'

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
            2. Aviso Importante — Limitações do Serviço
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
            <strong style={{ color: '#FFFFFF' }}>consentimento do titular</strong> (Lei 13.709/2018 — LGPD,
            Art. 7º, inciso I). Os dados coletados incluem:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
            <li>
              <strong style={{ color: '#FFFFFF' }}>Lista de espera:</strong> endereço de e-mail — para comunicação
              sobre lançamento e atualizações do produto.
            </li>
            <li>
              <strong style={{ color: '#FFFFFF' }}>Avaliação cognitiva:</strong> respostas ao questionário —
              utilizadas exclusivamente para geração do relatório individual. Não são compartilhadas com terceiros
              e não são utilizadas para treinar modelos de inteligência artificial externos.
            </li>
            <li>
              <strong style={{ color: '#FFFFFF' }}>Dados de uso:</strong> informações de navegação anonimizadas
              (via PostHog) — para melhoria da plataforma.
            </li>
          </ul>
          <p style={{ lineHeight: 1.7, marginTop: '1rem' }}>
            Você pode revogar seu consentimento a qualquer momento enviando e-mail para{' '}
            <a href="mailto:hello@gnosiq.ai" style={{ color: '#8B5CF6' }}>
              hello@gnosiq.ai
            </a>{' '}
            com o assunto <strong style={{ color: '#FFFFFF' }}>&ldquo;LGPD &mdash; Revogar Consentimento&rdquo;</strong>.
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
            <a href="mailto:support@gnosiq.ai" style={{ color: '#8B5CF6' }}>
              support@gnosiq.ai
            </a>{' '}
            com o assunto <strong style={{ color: '#FFFFFF' }}>&ldquo;Reembolso &mdash; [seu pedido]&rdquo;</strong>. O valor será
            estornado em até 5 dias úteis.
          </p>
        </div>

        {/* Cláusula 5 — Limitação de Responsabilidade */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            5. Limitação de Responsabilidade
          </h2>
          <p style={{ lineHeight: 1.7 }}>
            Os relatórios GnosIQ são instrumentos de autoconhecimento e desenvolvimento.
            Não substituem avaliação clínica, diagnóstico psicológico ou psiquiátrico,
            nem devem ser usados como base para decisões médicas ou jurídicas.
          </p>
        </div>

        {/* Cláusula 6 — Jurisdição */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            6. Jurisdição e Foro
          </h2>
          <p style={{ lineHeight: 1.7 }}>
            Estes Termos são regidos pelas leis da{' '}
            <strong style={{ color: '#FFFFFF' }}>República Federativa do Brasil</strong>. Fica eleito o foro da
            comarca de <strong style={{ color: '#FFFFFF' }}>São Paulo, Estado de São Paulo</strong>, para dirimir
            quaisquer controvérsias decorrentes deste instrumento, com renúncia expressa a qualquer outro, por
            mais privilegiado que seja.
          </p>
        </div>

        {/* Cláusula 7 — Controlador dos dados */}
        <div style={{ marginBottom: '3rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#8B5CF6',
              marginBottom: '0.75rem',
            }}
          >
            7. Controlador dos Dados e Contato
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
            <strong style={{ color: '#FFFFFF' }}>Carlos Alberto Gomes</strong>
            <br />
            GnosIQ · CNPJ 66.473.762/0001-13
            <br />
            São Paulo, SP — Brasil
            <br />
            <a href="mailto:hello@gnosiq.ai" style={{ color: '#8B5CF6' }}>
              hello@gnosiq.ai
            </a>{' '}
            ·{' '}
            <a href="https://gnosiq.ai" style={{ color: '#8B5CF6' }}>
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
