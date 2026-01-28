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

type StatusChangeEmailProps = {
  recipientName: string
  feedbackTitle: string
  feedbackId: string
  oldStatus: string
  newStatus: string
  adminNote?: string
}

const statusLabels: Record<string, string> = {
  pending: 'Pending Review',
  under_review: 'Under Review',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  declined: 'Declined',
}

const statusColors: Record<string, string> = {
  pending: '#6b7280',
  under_review: '#f59e0b',
  planned: '#3b82f6',
  in_progress: '#8b5cf6',
  completed: '#10b981',
  declined: '#ef4444',
}

export const StatusChangeEmail = ({
  recipientName,
  feedbackTitle,
  feedbackId,
  oldStatus,
  newStatus,
  adminNote,
}: StatusChangeEmailProps) => {
  const previewText = `Your feedback "${feedbackTitle}" is now ${statusLabels[newStatus] || newStatus}`
  const feedbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://urpeer.vercel.app'}/feedback/${feedbackId}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Feedback Status Updated</Heading>

          <Text style={paragraph}>Hi {recipientName},</Text>

          <Text style={paragraph}>
            Great news! The status of your feedback has been updated.
          </Text>

          <Section style={feedbackCard}>
            <Text style={feedbackTitle_style}>{feedbackTitle}</Text>
          </Section>

          <Section style={statusContainer}>
            <div style={statusBadgeContainer}>
              <span style={{ ...statusBadge, backgroundColor: statusColors[oldStatus] || '#6b7280' }}>
                {statusLabels[oldStatus] || oldStatus}
              </span>
              <span style={arrow}>→</span>
              <span style={{ ...statusBadge, backgroundColor: statusColors[newStatus] || '#6b7280' }}>
                {statusLabels[newStatus] || newStatus}
              </span>
            </div>
          </Section>

          {adminNote && (
            <Section style={noteCard}>
              <Text style={noteLabel}>Note from the team:</Text>
              <Text style={noteText}>{adminNote}</Text>
            </Section>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={feedbackUrl}>
              View Feedback
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

const statusContainer = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const statusBadgeContainer = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '12px',
}

const statusBadge = {
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: '9999px',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '600',
}

const arrow = {
  fontSize: '20px',
  color: '#6b7280',
}

const noteCard = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  borderLeft: '4px solid #f59e0b',
}

const noteLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
}

const noteText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#78350f',
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

export default StatusChangeEmail
