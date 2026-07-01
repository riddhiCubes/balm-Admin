import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiAcornDuotone,
    PiBagSimpleDuotone,
    PiUsersLight,
    PiPaintBrushBroadDuotone,
    PiUsersDuotone,
    PiCirclesThreePlusDuotone,
    PiMusicNotesSimpleDuotone,
    PiCrownDuotone,
    PiGearDuotone,
    PiWarningCircleDuotone,
} from 'react-icons/pi'
import type { JSX } from 'react'
import { MdOutlineNotificationsActive } from 'react-icons/md'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    singleMenu: <PiAcornDuotone />,
    collapseMenu: <PiArrowsInDuotone />,
    groupSingleMenu: <PiBookOpenUserDuotone />,
    groupCollapseMenu: <PiBookBookmarkDuotone />,
    groupMenu: <PiBagSimpleDuotone />,
    users: <PiUsersDuotone />,
    category: <PiCirclesThreePlusDuotone />,
    theme: <PiPaintBrushBroadDuotone />,
    music: <PiMusicNotesSimpleDuotone />,
    premium: <PiCrownDuotone />,
    setting: <PiGearDuotone />,
    notificationsend: <MdOutlineNotificationsActive />,
    about: <PiWarningCircleDuotone />
}

export default navigationIcon
