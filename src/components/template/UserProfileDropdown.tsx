import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link, useNavigate } from 'react-router-dom'
import { PiUserDuotone, PiSignOutDuotone } from 'react-icons/pi'
import { useAuth } from '@/auth'
import type { JSX } from 'react';
const balmLogo = `${import.meta.env.BASE_URL}img/balm-logo/app-icon.jpg`
import { VscLock } from 'react-icons/vsc'
import { logoutApi } from '@/Service/ApiService'
import toast from 'react-hot-toast'
import { LuKeyRound } from 'react-icons/lu'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = []

const _UserDropdown = () => {
    const { avatar, userName, email } = useSessionUser((state) => state.user)
    const navigate = useNavigate();
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    );
    const device_id = localStorage.getItem("deviceId");

    // const { signOut } = useAuth()

    const handleSignOut = () => {
        // signOut();
        const body = {
            device_id:device_id
        };

        logoutApi(body)
            .then((res) => {
                if (res?.status === 200) {
                    localStorage.clear();
                    setSessionSignedIn(false);
                    navigate("/admin/sign-in");
                }
            }).catch((err) => {
                const errormsg = err?.response?.data?.message;
                toast.error(errormsg || "");
            })
    }
    const handleResetpassword = () => {
        navigate("/admin/reset-password");
    }

    const avatarProps = {
        ...(avatar ? { src: avatar } : { icon: <PiUserDuotone /> }),
    }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={40} src={balmLogo} />
                </div>
            }
            placement="bottom-end"
        >
            {/* <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar src={balmLogo} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            Balm Admin
                        </div>
                    </div>
                </div>
            </Dropdown.Item> */}
            {/* <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0"
                >
                    <Link className="flex h-full w-full px-2" to={item.path}>
                        <span className="flex gap-2 items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    </Link>
                </Dropdown.Item>
            ))} */}
            <Dropdown.Item
                eventKey="reset password"
                className="gap-2"
                onClick={handleResetpassword}
            >
                <span className="text-xl">
                    {/* <VscLock /> */}
                    <LuKeyRound />
                </span>
                <span>Change Password</span>
            </Dropdown.Item>
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
