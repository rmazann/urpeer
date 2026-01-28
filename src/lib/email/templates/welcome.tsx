import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

type WelcomeEmailProps = {
  userName: string
  workspaceName?: string
}

export const WelcomeEmail = ({ userName, workspaceName }: WelcomeEmailProps) => {
  const previewText = `Welcome to Urpeer${workspaceName ? ` - ${workspaceName}` : ''}!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to Urpeer!</Heading>

          <Text style={paragraph}>Hi {userName},</Text>

          <Text style={paragraph}>
            Thanks for signing up! We&apos;re excited to have you on board.
            {workspaceName && (
              <> You&apos;ve joined <strong>{workspaceName}</strong>.</>
            )}
          </Text>

          <Text style={paragraph}>
            Urpeer helps you collect and organize feedback from your users,
            plan your roadmap, and keep everyone updated with changelogs.
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://urpeer.vercel.app'}/feedback`}
            >
              Start Exploring
            </Button>
          </Section>

          <Text style={paragraph}>
            Here&apos;s what you can do:
          </Text>

          <ul style={list}>
            <li style={listItem}>Submit and vote on feedback</li>
            <li style={listItem}>Comment on discussions</li>
            <li style={listItem}>Track the product roadmap</li>
            <li style={listItem}>Stay updated with the changelog</li>
          </ul>

          <Hr style={hr} />

          <Text style={footer}>
            If you have any questions, just reply to this email.
          </Text>

          <Text style={footer}>
            - The Urpeer Team
          </Text>

          <Text style={footerLink}>
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://urpeer.vercel.app'}/profile/notifications`}>
              Manage your notification preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const heading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '24px',
  marginBottom: '24px',
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const list = {
  paddingLeft: '20px',
  color: '#484848',
}

const listItem = {
  fontSize: '14px',
  lineHeight: '24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
}

const footerLink = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '12px',
}

export default WelcomeEmail
