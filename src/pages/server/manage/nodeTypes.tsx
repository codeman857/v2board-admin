import { Tag } from 'antd'
import type { ReactNode } from 'react'
import type { NodeType } from '@/api/types'
import { AnyTLSDrawer } from './drawers/AnyTLSDrawer'
import { HysteriaDrawer } from './drawers/HysteriaDrawer'
import { ShadowsocksDrawer } from './drawers/ShadowsocksDrawer'
import type { NodeDrawerProps } from './drawers/shared'
import { TrojanDrawer } from './drawers/TrojanDrawer'
import { TuicDrawer } from './drawers/TuicDrawer'
import { V2nodeDrawer } from './drawers/V2nodeDrawer'
import { VlessDrawer } from './drawers/VlessDrawer'
import { VmessDrawer } from './drawers/VmessDrawer'

/** 协议标签颜色（原版 getTypeTag） */
const TYPE_COLORS: Record<NodeType, string> = {
  shadowsocks: '#489851',
  vmess: '#CB3180',
  trojan: '#EAB854',
  hysteria: '#1A1A1A',
  tuic: '#9400D3',
  vless: '#4080FF',
  anytls: '#FF8C00',
  v2node: '#FF0000',
}

/** 带协议颜色的标签（实心、白字） */
export function TypeTag({ type, children }: { type: NodeType; children: ReactNode }) {
  return (
    <Tag color={TYPE_COLORS[type]} variant="solid">
      {children}
    </Tag>
  )
}

/** 新建菜单（工具栏「+」）的顺序与文字 */
export const CREATE_MENU: Array<[NodeType, string]> = [
  ['v2node', 'V2node'],
  ['shadowsocks', 'Shadowsocks'],
  ['vmess', 'VMess'],
  ['trojan', 'Trojan'],
  ['hysteria', 'Hysteria'],
  ['tuic', 'Tuic'],
  ['vless', 'VLess'],
  ['anytls', 'AnyTLS'],
]

/** 「节点ID」列的协议筛选（与原版一致：筛选值转小写后与 type 比较） */
export const TYPE_FILTERS = ['V2node', 'Shadowsocks', 'Vmess', 'Trojan', 'Hysteria', 'Tuic', 'Vless', 'AnyTLS']

const DRAWERS: Record<NodeType, (props: NodeDrawerProps) => ReactNode> = {
  shadowsocks: ShadowsocksDrawer,
  vmess: VmessDrawer,
  trojan: TrojanDrawer,
  hysteria: HysteriaDrawer,
  tuic: TuicDrawer,
  vless: VlessDrawer,
  anytls: AnyTLSDrawer,
  v2node: V2nodeDrawer,
}

/** 按协议选择编辑抽屉 */
export function NodeDrawer({ type, ...props }: NodeDrawerProps & { type: NodeType }) {
  const Drawer = DRAWERS[type]
  return <Drawer {...props} />
}
