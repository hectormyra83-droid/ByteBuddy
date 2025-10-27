import React, { useState } from 'react';
import { analyzeLoggedFood } from '../../services/genkitService';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Label from '../ui/Label';
import Textarea from '../ui/Textarea';

const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

const formatResultText = (text: string) => {
    if (!text) return '';
    let html = text
        .replace(/### (.*$)/gim, '<h3 class="text-xl font-heading font-bold mt-6 mb-3">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
        .replace(/\[(Disclaimer:.*?)\]/g, '<p class="text-base text-muted-foreground my-4 p-4 bg-secondary rounded-lg border border-border"><em>$1</em></p>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^---$/gim, '<hr class="my-6 border-border" />')
        .replace(/\*Information sourced from: (.*)\*/gim, '<p class="text-sm text-muted-foreground mt-4"><em>Information sourced from: $1</em></p>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
    
    // Wrap consecutive <li> elements in a <ul>
    html = html.replace(/<li>/g, '<ul><li>').replace(/<\/li>(?!\s*<li>)/g, '</li></ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    return html;
};


interface FoodLoggingPageProps {
    setMobileSidebarOpen: (isOpen: boolean) => void;
}

const FoodLoggingPage: React.FC<FoodLoggingPageProps> = ({ setMobileSidebarOpen }) => {
    const [mealInput, setMealInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mealInput.trim()) return;
        setIsLoading(true);
        setResult('');

        try {
            const analysis = await analyzeLoggedFood(mealInput);
            setResult(analysis);
        } catch (error) {
            console.error("Error analyzing food:", error);
            setResult('Sorry, an error occurred while analyzing your meal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <header className="p-4 md:p-6 border-b border-border shrink-0 h-20 flex items-center">
                <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden mr-4 p-2 -ml-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <MenuIcon />
                </button>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold">Food Logging & Analysis</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Log Your Meal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="mealInput">What did you eat?</Label>
                                <Textarea
                                    id="mealInput"
                                    name="mealInput"
                                    value={mealInput}
                                    onChange={(e) => setMealInput(e.target.value)}
                                    placeholder="e.g., A bowl of oatmeal with berries and nuts, or a slice of pepperoni pizza and a soda..."
                                    rows={4}
                                    required
                                />
                            </div>
                            <div>
                                <Button type="submit" disabled={isLoading} className="w-full md:w-auto min-w-[200px] text-base py-3 h-12">
                                    {isLoading ? <><Spinner /> Analyzing Meal...</> : 'Analyze Meal'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {isLoading && (
                     <Card>
                        <CardContent className="p-6">
                           <div className="flex justify-center items-center space-x-3 text-muted-foreground">
                             <Spinner />
                             <span>Analyzing your meal with the latest nutritional data...</span>
                           </div>
                        </CardContent>
                    </Card>
                )}
                
                {result && !isLoading && (
                    <Card className="animate-fade-in-up">
                        <CardHeader>
                            <CardTitle>Your Meal Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="prose prose-invert max-w-none text-base md:text-lg" dangerouslySetInnerHTML={{ __html: formatResultText(result) }} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default FoodLoggingPage;
