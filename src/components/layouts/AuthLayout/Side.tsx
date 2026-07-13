import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common';

const side_image = `${import.meta.env.BASE_URL}img/balm-logo/login-side-4.svg`

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="flex h-full bg-white dark:bg-gradient-to-br dark:from-[#120c22] dark:via-[#181030] dark:to-[#241645] p-6">
            <div className="py-6 px-10 lg:flex flex-col flex-1 justify-between hidden items-end relative rounded-3xl xl:max-w-[520px] 2xl:max-w-[720px]">

                <img
                    src={side_image}
                    className="absolute h-full w-full top-0 rounded-3xl left-0 object-cover"
                />
                {/* <div className="absolute inset-0 bg-black opacity-50 rounded-3xl" /> */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {/* <img
                        src={Loginlogo}
                        className="w-32 h-auto"
                        alt="Login Logo"
                    /> */}
                </div>
            </div>
            <div className=" flex flex-col justify-center items-center flex-1 ">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px] dark:py-8 dark:rounded-2xl dark:border dark:border-[#332a5c] dark:bg-[#150d2b]/85 dark:shadow-2xl">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                            ...rest,
                        })
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Side
