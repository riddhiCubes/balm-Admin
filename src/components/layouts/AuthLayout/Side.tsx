import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common';
import Loginlogo from "../../../assets/image/carwashlogo.png";
import side_image from "../../../assets/images/Start Screen.png";

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="flex h-full bg-white dark:bg-gray-800 p-6">
            <div className=" flex flex-col justify-center items-center flex-1 ">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                            ...rest,
                        })
                        : null}
                </div>
            </div>
            <div className="py-6 px-10 lg:flex flex-col flex-1 justify-between hidden items-end relative rounded-3xl xl:max-w-[520px] 2xl:max-w-[720px]">

                <img
                    src={side_image}
                    className="absolute h-full w-full top-0 rounded-3xl left-0"
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
        </div>
    )
}

export default Side
