import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from "uuid";
import { loginApi } from '@/Service/ApiService'
import { useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import { Notification, toast } from '@/components/ui'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
}

type SignInFormSchema = {
    email: string
    password: string
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    email: z
        .string({ required_error: 'Please enter your email' })
        .min(1, { message: 'Please enter your email' }),
    password: z
        .string({ required_error: 'Please enter your password' })
        .min(1, { message: 'Please enter your password' }),
})

const SignInForm = (props: SignInFormProps) => {
    const navigate = useNavigate();
    let deviceId: any = localStorage.getItem("deviceId");
    let deviceToken = localStorage.getItem("deviceToken");
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )

    const { disableSubmit = false, className, setMessage, passwordHint } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const { signIn } = useAuth()

    const onSignIn = async (values: SignInFormSchema) => {
        const { email, password } = values

        if (!disableSubmit) {
            setSubmitting(true)

            // const result = await signIn({ email, password })

            // if (result?.status === 'failed') {
            //     setMessage?.(result.message)
            // }


            if (!deviceId) {
                deviceId = uuidv4();
                localStorage.setItem("deviceId", deviceId);
            }

            if (!deviceToken) {
                deviceToken = uuidv4();
                localStorage.setItem("deviceToken", deviceToken);
            }

            const body = {
                email: email,
                password: password,
                device_id: deviceId,
                device_token: deviceToken,
                device_type: "web"
            }

            loginApi(body)
                .then((res) => {
                    if (res?.status === 201) {
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || 'Login Successfully!'}</Notification>,
                            { placement: "top-end" }
                        )
                        navigate("/admin/dashboard");
                        setSessionSignedIn(true);
                    }
                    setSubmitting(false);
                    localStorage.setItem("zenpath_token", res?.data?.usertoken);
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || 'Invalid email and password '}</Notification>,
                        { placement: "top-end" }
                    )
                    setSubmitting(false);
                })
        }

        // setSubmitting(false)
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignIn)}>
                <FormItem
                    label="Email"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder="Email"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Password"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                    className={classNames(
                        passwordHint ? 'mb-0' : '',
                        errors.password?.message ? 'mb-8' : '',
                    )}
                >
                    <Controller
                        name="password"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <PasswordInput
                                type="text"
                                placeholder="Password"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                {passwordHint}
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    customColorClass={() =>
                        'bg-gradient-to-r from-[#9949F3] to-[#C078F8] text-neutral hover:opacity-90'
                    }
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
