'use client';

import React from 'react';
import { DeviceMode } from '@/types/canvas';
import { Wifi, Battery, Signal } from 'lucide-react';

interface DeviceFrameProps {
  device: DeviceMode;
  children: React.ReactNode;
}

export function DeviceFrame({ device, children }: DeviceFrameProps) {
  if (device === 'iphone') {
    return (
      <div className="flex justify-center items-center py-2 md:py-4">
        {/* iPhone 16 Pro モックアップフレーム */}
        <div className="relative w-[390px] h-[780px] bg-black rounded-[52px] p-[11px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-slate-800 flex flex-col transition-all duration-300">
          {/* ボリュームボタン・電源ボタン（サイドの突起） */}
          <div className="absolute -left-[14px] top-[115px] w-[3px] h-[26px] bg-slate-700 rounded-l-sm" />
          <div className="absolute -left-[14px] top-[155px] w-[3px] h-[48px] bg-slate-700 rounded-l-sm" />
          <div className="absolute -left-[14px] top-[215px] w-[3px] h-[48px] bg-slate-700 rounded-l-sm" />
          <div className="absolute -right-[14px] top-[170px] w-[3px] h-[65px] bg-slate-700 rounded-r-sm" />

          {/* iPhone スクリーン内部 */}
          <div className="relative w-full h-full bg-slate-900 rounded-[42px] overflow-hidden flex flex-col">
            {/* iOS ステータスバー & Dynamic Island */}
            <div className="relative h-11 w-full flex items-center justify-between px-7 pt-1 z-30 select-none bg-white/90 backdrop-blur-md">
              <span className="text-[13px] font-semibold text-slate-900 tracking-tight">
                9:41
              </span>

              {/* Dynamic Island */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[100px] h-[28px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
                <div className="w-2 h-2 rounded-full bg-indigo-500/80" />
              </div>

              <div className="flex items-center gap-1.5 text-slate-800">
                <Signal className="w-3 h-3 fill-current" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-4 h-4 fill-current" />
              </div>
            </div>

            {/* iPhone ノートコンテンツ */}
            <div className="flex-1 w-full h-[calc(100%-44px)] overflow-hidden flex flex-col bg-white">
              {children}
            </div>

            {/* iOS ホームインジケーター（下部バー） */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800/60 rounded-full z-30 pointer-events-none" />
          </div>
        </div>
      </div>
    );
  }

  // iPad Pro モックアップフレーム
  return (
    <div className="w-full h-full flex justify-center items-center py-1">
      <div className="relative w-full max-w-[1080px] h-[740px] md:h-[760px] bg-slate-900 rounded-[38px] p-[14px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-slate-800 flex flex-col transition-all duration-300">
        {/* Apple Pencil マグネット充電部（上部） */}
        <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-28 h-[3px] bg-slate-700/80 rounded-t-sm" />

        {/* iPad スクリーン内部 */}
        <div className="relative w-full h-full bg-white rounded-[26px] overflow-hidden flex flex-col shadow-inner">
          {/* iPadOS 上部ステータスバー */}
          <div className="h-7 w-full flex items-center justify-between px-6 select-none bg-slate-100/90 border-b border-slate-200/80 text-[11px] font-medium text-slate-700 z-30">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">9:41 火 11月3日</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-bold">
                iPadOS 18
              </span>
            </div>

            {/* Face ID / インカメラ */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800/90 ring-1 ring-slate-600/30" />

            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-[10px] font-mono">100%</span>
              <Battery className="w-3.5 h-3.5 fill-current text-slate-800" />
              <Wifi className="w-3 h-3" />
            </div>
          </div>

          {/* iPad ノートコンテンツ */}
          <div className="flex-1 w-full h-[calc(100%-28px)] overflow-hidden flex flex-col bg-white">
            {children}
          </div>

          {/* iPadOS ホームインジケーター */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-48 h-1 bg-slate-400/50 rounded-full z-30 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
