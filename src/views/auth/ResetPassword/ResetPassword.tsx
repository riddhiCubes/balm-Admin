import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ActionLink from '@/components/shared/ActionLink'
import ResetPasswordForm from './components/ResetPasswordForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useNavigate } from 'react-router-dom'
import { AdaptiveCard, Container } from '@/components/shared'

type ResetPasswordProps = {
    signInUrl?: string
}

export const ResetPasswordBase = ({
    signInUrl = '/sign-in',
}: ResetPasswordProps) => {
    const [resetComplete, setResetComplete] = useState(false)

    const [message, setMessage] = useTimeOutMessage()

    const navigate = useNavigate()

    const handleContinue = () => {
        navigate(signInUrl)
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="">
                    <h4>Change Password</h4>
                </div>
                {message && (
                    <Alert showIcon className="mb-4" type="danger">
                        <span className="break-all">{message}</span>
                    </Alert>
                )}
                <ResetPasswordForm
                    resetComplete={resetComplete}
                    setMessage={setMessage}
                    setResetComplete={setResetComplete}
                >
                    <Button
                        block
                        variant="solid"
                        type="button"
                        onClick={handleContinue}
                    >
                        Continue
                    </Button>
                </ResetPasswordForm>
            </AdaptiveCard>
        </Container>
    )
}

const ResetPassword = () => {
    return <ResetPasswordBase />
}

export default ResetPassword
