import { useState } from 'react';
import { useProfileStore } from '@/stores/useProfileStore';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, ChevronDown, Plus, User } from 'lucide-react';
import { AddProfileDialog } from '@/components/profile/AddProfileDialog';
import { Badge } from '@/components/ui/badge';

export function ProfileSwitcher() {
    const { profiles, currentProfile, switchProfile } = useProfileStore();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRelationshipColor = (relationship: string) => {
        const rel = relationship.toLowerCase();
        if (rel === 'self') return 'bg-primary text-primary-foreground';
        if (rel === 'father' || rel === 'mother') return 'bg-blue-500/10 text-blue-600';
        if (rel === 'brother' || rel === 'sister') return 'bg-purple-500/10 text-purple-600';
        if (rel === 'spouse') return 'bg-pink-500/10 text-pink-600';
        if (rel === 'child') return 'bg-green-500/10 text-green-600';
        return 'bg-gray-500/10 text-gray-600';
    };

    if (!currentProfile || profiles.length === 0) {
        return null;
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 min-w-[200px] justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                    {getInitials(currentProfile.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-medium truncate max-w-[120px]">
                                    {currentProfile.full_name}
                                </span>
                            </div>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[280px]">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        Switch Profile
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {profiles.map((profile) => (
                        <DropdownMenuItem
                            key={profile.patient_id}
                            onClick={() => switchProfile(profile.patient_id)}
                            className="flex items-center gap-3 cursor-pointer py-3"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                    {getInitials(profile.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">
                                        {profile.full_name}
                                    </p>
                                    {profile.is_primary && (
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                            Primary
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {profile.relationship}
                                </p>
                            </div>
                            {currentProfile.patient_id === profile.patient_id && (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setIsAddDialogOpen(true)}
                        className="flex items-center gap-2 cursor-pointer text-primary"
                    >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Plus className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Add New Profile</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AddProfileDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />
        </>
    );
}
