import { useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { apiResetPassword } from '@/services/AuthService'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import { changepasswordApi } from '@/Service/ApiService'
import { Notification, toast } from '@/components/ui'

interface ResetPasswordFormProps extends CommonProps {
    resetComplete: boolean
    setResetComplete?: (compplete: boolean) => void
    setMessage?: (message: string) => void
}

type PasswordSchema = {
    old_password: string
    new_password: string
    confirmNewPassword: string
}

const validationSchema: ZodType<PasswordSchema> = z
    .object({
        old_password: z
            .string()
            .min(1, { message: 'Please enter your current password!' }),
        new_password: z
            .string()
            .min(1, { message: 'Please enter your new password!' }),
        confirmNewPassword: z
            .string()
            .min(1, { message: 'Please enter confirm your new password!' }),
    })
    .refine((data) => data.confirmNewPassword === data.new_password, {
        message: 'Confirm Password not match',
        path: ['confirmNewPassword'],
    })

const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { className, setMessage, setResetComplete, resetComplete, children } =
        props

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<PasswordSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            old_password: '',
            new_password: '',
            confirmNewPassword: '',
        },
    })

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        const body = {
            old_password: data?.old_password,
            new_password: data?.new_password,
        };
        changepasswordApi(body)
            .then((res) => {
                if (res?.status === 200) {
                    const successmsg = res?.data?.message;
                    // toast.success(successmsg || "Login Successfully!");
                    toast.push(
                        <Notification type='success'>{successmsg || "Change Password Successfully!"}</Notification>,
                        { placement: "top-end" }
                    )
                    reset();
                }
                setSubmitting(false);
            }).catch((err) => {
                const errormsg = err?.response?.data?.message;
                // toast.error(errormsg || "Password not changed!");
                toast.push(
                    <Notification type='danger'>{errormsg || "Password not changed!"}</Notification>,
                    { placement: "top-end" }
                )
                setSubmitting(false);
            })
    };

    return (
        <div className="bg-white p-5 rounded-md ">
            <Form
                ref={formRef}
                className=""
                onSubmit={handleSubmit(onSubmit)}
            >
                <FormItem
                    label="Current password"
                    invalid={Boolean(errors.old_password)}
                    errorMessage={errors.old_password?.message}
                >
                    <Controller
                        name="old_password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="New password"
                    invalid={Boolean(errors.new_password)}
                    errorMessage={errors.new_password?.message}
                >
                    <Controller
                        name="new_password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Confirm new password"
                    invalid={Boolean(errors.confirmNewPassword)}
                    errorMessage={errors.confirmNewPassword?.message}
                >
                    <Controller
                        name="confirmNewPassword"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="flex justify-end">
                    <Button variant="solid" type="submit" disabled={isSubmitting} loading={isSubmitting}>
                        Update
                    </Button>
                </div>
            </Form>
        </div>
    )
}

export default ResetPasswordForm
