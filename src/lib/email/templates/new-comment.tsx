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

type NewCommentEmailProps = {
  recipientName: string
  commenterName: string
  feedbackTitle: string
  feedbackId: string
  commentPreview: string
}

export const NewCommentEmail = ({
  recipientName,
  commenterName,
  feedbackTitle,
  feedbackId,
  commentPreview,
}: NewCommentEmailProps) => {
  const previewText = `${commenterName} commented on "${feedbackTitle}"`
  const feedbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://urpeer.vercel.app'}/feedback/${feedbackId}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Comment on Your Feedback</Heading>

          <Text style={paragraph}>Hi {recipientName},</Text>

          <Text style={paragraph}>
            <strong>{commenterName}</strong> left a comment on your feedback:
          </Text>

          <Section style={feedbackCard}>
            <Text style={feedbackTitle_style}>{feedbackTitle}</Text>
          </Section>

          <Section style={commentCard}>
            <Text style={commentText}>&ldquo;{commentPreview}&rdquo;</Text>
            <Text style={commentAuthor}>- {commenterName}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={feedbackUrl}>
              View Discussion
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You&apos;re receiving this because you submitted this feedback on Urpeer.
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

const feedbackCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '16px',
  marginBottom: '16px',
  border: '1px solid #e5e7eb',
}

const feedbackTitle_style = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
}

const commentCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  borderLeft: '4px solid #000000',
}

const commentText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#374151',
  margin: '0 0 8px 0',
  fontStyle: 'italic',
}

const commentAuthor = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
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

export default NewCommentEmail
