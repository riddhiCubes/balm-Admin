import Alert from '@/components/ui/Alert'
import SignInForm from './components/SignInForm'
import OauthSignIn from './components/OauthSignIn'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'

type SignInProps = {
    signUpUrl?: string
    forgetPasswordUrl?: string
    disableSubmit?: boolean
}

export const SignInBase = ({
    signUpUrl = '/sign-up',
    forgetPasswordUrl = '/forgot-password',
    disableSubmit,
}: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()

    return (
        <>
            <div className="mb-8 flex items-center gap-3">
                <img
                    src={`${import.meta.env.BASE_URL}img/balm-logo/app-icon.jpg`}
                    className="rounded-2xl"
                    style={{ width: 60 }}
                    alt="Balm logo"
                />
                <h3 className="bg-gradient-to-r from-[#a855f7] to-[#c084fc] bg-clip-text text-transparent tracking-wide">
                    Balm
                </h3>
            </div>
            <div className="mb-10">
                <h2 className="mb-2">Welcome back!</h2>
                <p className="font-semibold heading-text">
                    Please enter your credentials to sign in!
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignInForm
                disableSubmit={disableSubmit}
                setMessage={setMessage}
            />
        </>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
