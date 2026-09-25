import {useState} from 'react';
export function useWorkspaceNavigation(){
 const [workspace,setWorkspace]=useState<'desk'|'ai'|'improvement'>('desk');
 return {workspace,openWorkspace:setWorkspace,goHome:()=>setWorkspace('desk')};
}
