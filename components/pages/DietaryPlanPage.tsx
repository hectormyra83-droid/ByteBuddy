import React, { useState } from 'react';
import { generateDietaryPlan } from '../../services/genkitService';
import type { DietaryPlanRequest } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
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
    const html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-heading font-bold mt-6 mb-3">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
        .replace(/\[(Disclaimer:.*?)\]/g, '<p class="text-base text-muted-foreground my-4 p-4 bg-secondary rounded-lg border border-border"><em>$1</em></p>')
        .replace(/^\* (.*$)/gim, '<p class="pl-5 mb-2 relative before:content-[\'•\'] before:absolute before:left-0 before:text-primary">$1</p>')
        .replace(/^---$/gim, '<hr class="my-6 border-border" />');
    return html;
};

interface DietaryPlanPageProps {
    setMobileSidebarOpen: (isOpen: boolean) => void;
}


const DietaryPlanPage: React.FC<DietaryPlanPageProps> = ({ setMobileSidebarOpen }) => {
    const [formData, setFormData] = useState<DietaryPlanRequest>({
        age: '',
        gender: '',
        height: '',
        weight: '',
        units: 'metric',
        activityLevel: '',
        goal: '',
        dietaryRestrictions: '',
        usualFoods: '',
        eatingHabits: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string; advice: string; exerciseAdvice: string; } | null>(null);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateBmi = () => {
        const height = parseFloat(formData.height);
        const weight = parseFloat(formData.weight);

        if (!height || !weight || height <= 0 || weight <= 0) return null;

        let bmi;
        if (formData.units === 'metric') {
            bmi = weight / ((height / 100) ** 2);
        } else {
            bmi = (weight / (height ** 2)) * 703;
        }
        
        if (isNaN(bmi)) return null;

        let category = '';
        let advice = '';
        let exerciseAdvice = '';

        if (bmi < 18.5) {
            category = 'Underweight';
            advice = 'You may want to consider healthy ways to gain weight. A balanced diet with sufficient calories is important.';
            exerciseAdvice = 'Consider light activities like walking for 20-30 minutes daily and strength training to build healthy muscle mass.';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Healthy Weight';
            advice = 'Great job! You are in a healthy weight range. Focus on maintaining your current lifestyle.';
            exerciseAdvice = 'To maintain your weight and fitness, aim for at least 30 minutes of moderate activity, like brisk walking, most days of the week.';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            advice = 'You might consider setting a weight loss goal to reach a healthier BMI range. A combination of diet and exercise can help.';
            exerciseAdvice = 'A great starting point is to incorporate 30-45 minutes of brisk walking or cycling into your daily routine.';
        } else {
            category = 'Obese';
            advice = 'It is highly recommended to work towards a healthier weight. Consulting a healthcare provider can provide a safe and effective plan.';
            exerciseAdvice = 'Starting with low-impact activities is key. Aim for 20-30 minutes of walking daily, and gradually increase the duration as you feel comfortable.';
        }

        return { bmi: parseFloat(bmi.toFixed(1)), category, advice, exerciseAdvice };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');
        
        const bmiData = calculateBmi();
        setBmiResult(bmiData);

        try {
            const plan = await generateDietaryPlan(formData);
            setResult(plan);
        } catch (error) {
            setResult('Sorry, an error occurred while generating your dietary plan. Please try again.');
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
                <h1 className="text-2xl sm:text-3xl font-heading font-bold">Generate a Dietary Plan</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Health Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Form Fields */}
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="e.g., 30" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className="flex h-12 w-full items-center justify-between rounded-lg border border-input bg-secondary px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="" disabled>Select gender...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div className="col-span-1 md:col-span-2 space-y-2">
                               <Label>Height & Weight</Label>
                                <div className="flex flex-col sm:flex-row items-center gap-2">
                                    <Input id="height" name="height" type="number" value={formData.height} onChange={handleChange} placeholder={formData.units === 'metric' ? 'Height (cm)' : 'Height (in)'} required />
                                    <Input id="weight" name="weight" type="number" value={formData.weight} onChange={handleChange} placeholder={formData.units === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'} required />
                                    <select name="units" value={formData.units} onChange={handleChange} className="h-12 w-full sm:w-auto rounded-lg border border-input bg-secondary px-3 text-base">
                                        <option value="metric">Metric</option>
                                        <option value="imperial">Imperial</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="goal">Primary Goal</Label>
                                <select id="goal" name="goal" value={formData.goal} onChange={handleChange} required className="flex h-12 w-full items-center justify-between rounded-lg border border-input bg-secondary px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option value="" disabled>Select goal...</option>
                                    <option value="lose_weight">Lose Weight</option>
                                    <option value="maintain_weight">Maintain Weight</option>
                                    <option value="gain_muscle">Gain Muscle</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="activityLevel">Daily Activity Level</Label>
                                <select id="activityLevel" name="activityLevel" value={formData.activityLevel} onChange={handleChange} required className="flex h-12 w-full items-center justify-between rounded-lg border border-input bg-secondary px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option value="" disabled>Select activity level...</option>
                                    <option value="sedentary">Sedentary (little or no exercise)</option>
                                    <option value="light">Lightly Active (light exercise/sports 1-3 days/week)</option>
                                    <option value="moderate">Moderately Active (moderate exercise/sports 3-5 days/week)</option>
                                    <option value="active">Very Active (hard exercise/sports 6-7 days a week)</option>
                                    <option value="very_active">Extra Active (very hard exercise & physical job)</option>
                                </select>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <Label htmlFor="dietaryRestrictions">Dietary Restrictions or Allergies</Label>
                                <Textarea id="dietaryRestrictions" name="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={handleChange} placeholder="e.g., gluten-free, vegetarian, lactose intolerant, none" />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <Label htmlFor="usualFoods">What do you typically eat?</Label>
                                <Textarea id="usualFoods" name="usualFoods" value={formData.usualFoods} onChange={handleChange} placeholder="e.g., pasta, chicken and rice, salads, fast food..." />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <Label htmlFor="eatingHabits">Describe your eating habits.</Label>
                                <Textarea id="eatingHabits" name="eatingHabits" value={formData.eatingHabits} onChange={handleChange} placeholder="e.g., I often skip breakfast, I snack a lot in the evening..." />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <Button type="submit" disabled={isLoading} className="w-full md:w-auto min-w-[200px] text-base py-3 h-12">
                                    {isLoading ? <><Spinner /> Generating Your Plan...</> : 'Generate Personalized Plan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {bmiResult && !isLoading && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your BMI Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="text-lg md:text-xl space-y-2">
                            <p>Your BMI is: <span className="font-bold text-transparent bg-clip-text" style={{backgroundImage: 'var(--gradient-primary)'}}>{bmiResult.bmi}</span></p>
                            <p>This falls into the <span className="font-bold text-accent">{bmiResult.category}</span> category.</p>
                            <p className="text-base md:text-lg text-muted-foreground">{bmiResult.advice}</p>
                             <div className="pt-2">
                                 <p className="text-base md:text-lg text-foreground"><strong className="font-semibold">Exercise Tip:</strong> {bmiResult.exerciseAdvice}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {result && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Personalized 7-Day Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="text-lg md:text-xl" dangerouslySetInnerHTML={{ __html: formatResultText(result) }} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default DietaryPlanPage;