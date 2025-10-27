import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Logo from './Logo';
import type { Conversation } from '../types';

// Icons
const NewChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}><path d="M15 18l-6-6 6-6"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const DietaryPlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V21c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h7.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path><path d="M15 2v5h5"></path><path d="M10 16s1-1 2-1 2 1 2 1"></path><path d="M10 12s1-1 2-1 2 1 2 1"></path></svg>;
const FoodLoggingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M12 10a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z"/><path d="M12 10V2"/></svg>;


const EditableTitle: React.FC<{ chat: Conversation; update: (id: string, title: string) => void; isCollapsed: boolean; }> = ({ chat, update, isCollapsed }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(chat.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    
    useEffect(() => {
        setTitle(chat.title);
    }, [chat.title])

    const handleSave = () => {
        if (title.trim()) {
            update(chat.id, title.trim());
        } else {
            setTitle(chat.title); // reset if empty
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return <input 
            ref={inputRef}
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            onBlur={handleSave}
            onKeyDown={(e) => { if(e.key === 'Enter') handleSave() }}
            className="bg-transparent border border-primary rounded-md px-1 w-full text-sm"
        />
    }

    return (
        <>
            <span className="truncate flex-1">{chat.title}</span>
            <div className={`absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isCollapsed ? 'hidden' : ''}`}>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }} className="p-1 rounded-md hover:text-primary hover:bg-background/50"><EditIcon /></button>
            </div>
        </>
    );
};


interface SidebarProps {
    conversations: Conversation[];
    deleteConversation: (id: string) => void;
    updateConversationTitle: (id: string, title: string) => void;
    logout: () => void;
    userName: string;
    isMobileOpen: boolean;
    setMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ conversations, deleteConversation, updateConversationTitle, logout, userName, isMobileOpen, setMobileOpen }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const handleNavLinkClick = () => {
        if (isMobileOpen) {
            setMobileOpen(false);
        }
    };
    
    const navLinkClasses = 'group relative flex items-center p-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out';
    const activeNavLinkClasses = 'text-primary-foreground';
    const inactiveNavLinkClasses = 'text-muted-foreground hover:text-foreground hover:bg-secondary';
    
    // On mobile, the sidebar is never in the "collapsed" icon-only state. It's either fully open or fully hidden.
    const effectiveCollapsed = !isMobileOpen && isCollapsed;

    return (
        <>
        {isMobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden" />}
        <aside className={`flex flex-col bg-card/50 border-r border-border backdrop-blur-sm transition-transform duration-300 ease-in-out md:flex fixed inset-y-0 left-0 z-50 md:relative ${effectiveCollapsed ? 'w-20' : 'w-72'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="flex items-center h-20 border-b border-border px-4 shrink-0">
                <div className={`flex items-center ${effectiveCollapsed ? 'justify-center w-full' : ''}`}>
                    <Logo className="w-10 h-10" />
                    <span className={`font-heading text-xl font-bold ml-3 transition-all duration-300 ease-in-out ${effectiveCollapsed ? 'opacity-0 -translate-x-4 w-0' : 'opacity-100 translate-x-0'}`}>ByteBuddy</span>
                </div>
            </div>
            
            <div className="p-2 space-y-2 flex-1 flex flex-col overflow-hidden">
                <NavLink to="/chat" onClick={handleNavLinkClick} className={`flex items-center px-3 py-4 rounded-lg text-base font-semibold border border-dashed border-border hover:border-primary hover:text-primary transition-colors ${effectiveCollapsed ? 'justify-center' : ''}`}>
                    <NewChatIcon />
                    <span className={`ml-2 whitespace-nowrap transition-all duration-300 ease-in-out ${effectiveCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>New Chat</span>
                </NavLink>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1 -mr-1">
                    {conversations.map((chat) => (
                        <NavLink
                            key={chat.id}
                            to={`/chat/${chat.id}`}
                            onClick={handleNavLinkClick}
                            className={({ isActive }) => 
                                `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses} ${effectiveCollapsed ? 'justify-center' : ''}`
                            }
                        >
                             <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{background: 'radial-gradient(circle at center, hsl(220 14% 30% / 0.5), transparent)'}}></span>
                             <div className="absolute inset-0 rounded-lg" style={{ background: 'var(--gradient-primary)', opacity: 0, transition: 'opacity 0.3s ease-in-out' }}></div>
                             <div className={`relative flex-1 flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${effectiveCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
                                <EditableTitle chat={chat} update={updateConversationTitle} isCollapsed={effectiveCollapsed} />
                             </div>
                             {effectiveCollapsed && <span className="relative font-semibold text-lg">{chat.title.charAt(0).toUpperCase()}</span>}
                        </NavLink>
                    ))}
                </div>
                
                <div className="pt-2 border-t border-border space-y-1">
                    <NavLink
                        to="/food-logging"
                        onClick={handleNavLinkClick}
                        className={({ isActive }) => 
                            `group relative flex items-center px-3 py-4 rounded-lg text-base font-medium transition-all duration-200 ease-in-out ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses} ${effectiveCollapsed ? 'justify-center' : ''}`
                        }
                    >
                         <div className="absolute inset-0 rounded-lg" style={{ background: 'var(--gradient-primary)', opacity: 0, transition: 'opacity 0.3s ease-in-out' }}></div>
                         <FoodLoggingIcon />
                         <span className={`relative ml-2 whitespace-nowrap transition-all duration-300 ease-in-out ${effectiveCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Food Logging</span>
                    </NavLink>
                    <NavLink
                        to="/dietary-plan"
                        onClick={handleNavLinkClick}
                        className={({ isActive }) => 
                            `group relative flex items-center px-3 py-4 rounded-lg text-base font-medium transition-all duration-200 ease-in-out ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses} ${effectiveCollapsed ? 'justify-center' : ''}`
                        }
                    >
                         <div className="absolute inset-0 rounded-lg" style={{ background: 'var(--gradient-primary)', opacity: 0, transition: 'opacity 0.3s ease-in-out' }}></div>
                         <DietaryPlanIcon />
                         <span className={`relative ml-2 whitespace-nowrap transition-all duration-300 ease-in-out ${effectiveCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Dietary Plan</span>
                    </NavLink>
                </div>
            </div>

            <div className="p-2 border-t border-border">
                <div className={`flex items-center p-3 mb-1 ${effectiveCollapsed ? 'justify-center' : ''}`}>
                     <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-primary-foreground shrink-0" style={{background: 'var(--gradient-primary)'}}>
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-semibold truncate ml-3 transition-all duration-300 ease-in-out ${effectiveCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                        {userName}
                    </span>
                </div>
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`w-full hidden md:flex items-center p-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${effectiveCollapsed ? 'justify-center' : 'justify-start'}`}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <CollapseIcon collapsed={isCollapsed} />
                    <span className={`ml-2 whitespace-nowrap transition-all duration-300 ease-in-out ${effectiveCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Collapse</span>
                </button>
                 <button 
                    onClick={logout}
                    className={`w-full flex items-center p-3 rounded-lg text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors ${effectiveCollapsed ? 'justify-center' : 'justify-start'}`}
                    aria-label="Sign out"
                >
                    <LogoutIcon />
                    <span className={`ml-2 whitespace-nowrap transition-all duration-300 ease-in-out ${effectiveCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Sign Out</span>
                </button>
            </div>
        </aside>
        </>
    );
};

export default Sidebar;