 import { useState, useEffect } from 'react';
 import { useCalendar } from '@/context/CalendarContext';
 import { useCalendarData } from '@/hooks/useCalendarData';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { 
   CalendarDays, 
   MapPin, 
   Users, 
   Activity,
   CheckSquare,
   ShoppingCart,
   Paperclip,
   Plus,
   Trash2,
   X,
   Loader2
 } from 'lucide-react';
 import { format, addHours } from 'date-fns';
 import { CALENDAR_COLORS } from '@/types/calendar';
 import type { ChecklistItem, ShoppingItem } from '@/types/calendar';
 
 export function EventModal() {
   const { 
     isEventModalOpen, 
     setIsEventModalOpen, 
     selectedEvent, 
     setSelectedEvent,
     newEventDate,
     setNewEventDate,
     calendars
   } = useCalendar();
   const { createEvent, updateEvent, deleteEvent } = useCalendarData();
   
   const [isLoading, setIsLoading] = useState(false);
   const [title, setTitle] = useState('');
   const [description, setDescription] = useState('');
   const [location, setLocation] = useState('');
   const [activity, setActivity] = useState('');
   const [startTime, setStartTime] = useState('');
   const [endTime, setEndTime] = useState('');
   const [allDay, setAllDay] = useState(false);
   const [calendarId, setCalendarId] = useState('');
   const [color, setColor] = useState('#6366f1');
   
   const [checklist, setChecklist] = useState<Partial<ChecklistItem>[]>([]);
   const [newChecklistItem, setNewChecklistItem] = useState('');
   
   const [shoppingList, setShoppingList] = useState<Partial<ShoppingItem>[]>([]);
   const [newShoppingItem, setNewShoppingItem] = useState({ name: '', quantity: 1, unit: '', price: 0 });
 
   const isEditing = !!selectedEvent;
 
   useEffect(() => {
     if (selectedEvent) {
       setTitle(selectedEvent.title);
       setDescription(selectedEvent.description || '');
       setLocation(selectedEvent.location || '');
       setActivity(selectedEvent.activity || '');
       setStartTime(format(new Date(selectedEvent.start_time), "yyyy-MM-dd'T'HH:mm"));
       setEndTime(format(new Date(selectedEvent.end_time), "yyyy-MM-dd'T'HH:mm"));
       setAllDay(selectedEvent.all_day);
       setCalendarId(selectedEvent.calendar_id);
       setColor(selectedEvent.color || '#6366f1');
     } else if (newEventDate) {
       const start = newEventDate;
       const end = addHours(start, 1);
       setStartTime(format(start, "yyyy-MM-dd'T'HH:mm"));
       setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
       if (calendars.length > 0 && !calendarId) {
         setCalendarId(calendars[0].id);
       }
     }
   }, [selectedEvent, newEventDate, calendars]);
 
   const handleClose = () => {
     setIsEventModalOpen(false);
     setSelectedEvent(null);
     setNewEventDate(null);
     resetForm();
   };
 
   const resetForm = () => {
     setTitle('');
     setDescription('');
     setLocation('');
     setActivity('');
     setStartTime('');
     setEndTime('');
     setAllDay(false);
     setColor('#6366f1');
     setChecklist([]);
     setShoppingList([]);
   };
 
   const handleSubmit = async () => {
     if (!title.trim() || !calendarId) return;
     
     setIsLoading(true);
     
     const eventData = {
       title,
       description,
       location,
       activity,
       start_time: new Date(startTime).toISOString(),
       end_time: new Date(endTime).toISOString(),
       all_day: allDay,
       calendar_id: calendarId,
       color,
     };
     
     if (isEditing) {
       await updateEvent(selectedEvent.id, eventData);
     } else {
       await createEvent(eventData);
     }
     
     setIsLoading(false);
     handleClose();
   };
 
   const handleDelete = async () => {
     if (!selectedEvent) return;
     setIsLoading(true);
     await deleteEvent(selectedEvent.id);
     setIsLoading(false);
     handleClose();
   };
 
   const addChecklistItem = () => {
     if (!newChecklistItem.trim()) return;
     setChecklist([...checklist, { title: newChecklistItem, is_completed: false }]);
     setNewChecklistItem('');
   };
 
   const toggleChecklistItem = (index: number) => {
     const updated = [...checklist];
     updated[index].is_completed = !updated[index].is_completed;
     setChecklist(updated);
   };
 
   const removeChecklistItem = (index: number) => {
     setChecklist(checklist.filter((_, i) => i !== index));
   };
 
   const addShoppingItem = () => {
     if (!newShoppingItem.name.trim()) return;
     setShoppingList([...shoppingList, { 
       item_name: newShoppingItem.name,
       quantity: newShoppingItem.quantity,
       unit: newShoppingItem.unit,
       price: newShoppingItem.price,
       is_purchased: false
     }]);
     setNewShoppingItem({ name: '', quantity: 1, unit: '', price: 0 });
   };
 
   const toggleShoppingItem = (index: number) => {
     const updated = [...shoppingList];
     updated[index].is_purchased = !updated[index].is_purchased;
     setShoppingList(updated);
   };
 
   const removeShoppingItem = (index: number) => {
     setShoppingList(shoppingList.filter((_, i) => i !== index));
   };
 
   const totalShoppingPrice = shoppingList.reduce((sum, item) => 
     sum + ((item.price || 0) * (item.quantity || 1)), 0
   );
 
   return (
     <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
       <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <CalendarDays className="h-5 w-5 text-primary" />
             {isEditing ? 'Editar Hito' : 'Nuevo Hito'}
           </DialogTitle>
         </DialogHeader>
         
         <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
           <TabsList className="grid grid-cols-4 mb-4">
             <TabsTrigger value="details" className="text-xs">Detalles</TabsTrigger>
             <TabsTrigger value="checklist" className="text-xs">Pendientes</TabsTrigger>
             <TabsTrigger value="shopping" className="text-xs">Compras</TabsTrigger>
             <TabsTrigger value="attachments" className="text-xs">Adjuntos</TabsTrigger>
           </TabsList>
           
           <ScrollArea className="flex-1 pr-4">
             <TabsContent value="details" className="mt-0 space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="title">Título del hito</Label>
                 <Input
                   id="title"
                   placeholder="Nombre del evento"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="start">Inicio</Label>
                   <Input
                     id="start"
                     type="datetime-local"
                     value={startTime}
                     onChange={(e) => setStartTime(e.target.value)}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="end">Fin</Label>
                   <Input
                     id="end"
                     type="datetime-local"
                     value={endTime}
                     onChange={(e) => setEndTime(e.target.value)}
                   />
                 </div>
               </div>
               
               <div className="flex items-center gap-2">
                 <Checkbox
                   id="allDay"
                   checked={allDay}
                   onCheckedChange={(checked) => setAllDay(checked as boolean)}
                 />
                 <Label htmlFor="allDay">Todo el día</Label>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="calendar">Calendario</Label>
                   <Select value={calendarId} onValueChange={setCalendarId}>
                     <SelectTrigger>
                       <SelectValue placeholder="Selecciona calendario" />
                     </SelectTrigger>
                     <SelectContent>
                       {calendars.map((cal) => (
                         <SelectItem key={cal.id} value={cal.id}>
                           <div className="flex items-center gap-2">
                             <div 
                               className="w-3 h-3 rounded-full" 
                               style={{ backgroundColor: cal.color }}
                             />
                             {cal.name}
                           </div>
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 
                 <div className="space-y-2">
                   <Label>Color</Label>
                   <div className="flex flex-wrap gap-1">
                     {CALENDAR_COLORS.map((c) => (
                       <button
                         key={c}
                         type="button"
                         onClick={() => setColor(c)}
                         className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                           color === c ? 'ring-2 ring-offset-2 ring-primary' : ''
                         }`}
                         style={{ backgroundColor: c }}
                       />
                     ))}
                   </div>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="location" className="flex items-center gap-2">
                   <MapPin className="h-4 w-4" /> Lugar
                 </Label>
                 <Input
                   id="location"
                   placeholder="Ubicación del evento"
                   value={location}
                   onChange={(e) => setLocation(e.target.value)}
                 />
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="activity" className="flex items-center gap-2">
                   <Activity className="h-4 w-4" /> Actividad
                 </Label>
                 <Input
                   id="activity"
                   placeholder="Tipo de actividad"
                   value={activity}
                   onChange={(e) => setActivity(e.target.value)}
                 />
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="description">Descripción</Label>
                 <Textarea
                   id="description"
                   placeholder="Detalles adicionales..."
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   rows={3}
                 />
               </div>
             </TabsContent>
             
             <TabsContent value="checklist" className="mt-0 space-y-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                 <CheckSquare className="h-4 w-4" />
                 Lista de pendientes para este evento
               </div>
               
               <div className="flex gap-2">
                 <Input
                   placeholder="Nueva tarea..."
                   value={newChecklistItem}
                   onChange={(e) => setNewChecklistItem(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                 />
                 <Button onClick={addChecklistItem} size="icon">
                   <Plus className="h-4 w-4" />
                 </Button>
               </div>
               
               <div className="space-y-2">
                 {checklist.map((item, index) => (
                   <div 
                     key={index}
                     className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                   >
                     <Checkbox
                       checked={item.is_completed}
                       onCheckedChange={() => toggleChecklistItem(index)}
                     />
                     <span className={item.is_completed ? 'line-through text-muted-foreground' : ''}>
                       {item.title}
                     </span>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="ml-auto h-8 w-8"
                       onClick={() => removeChecklistItem(index)}
                     >
                       <X className="h-4 w-4" />
                     </Button>
                   </div>
                 ))}
                 {checklist.length === 0 && (
                   <p className="text-sm text-muted-foreground text-center py-4">
                     No hay tareas pendientes
                   </p>
                 )}
               </div>
             </TabsContent>
             
             <TabsContent value="shopping" className="mt-0 space-y-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                 <ShoppingCart className="h-4 w-4" />
                 Lista de compras con precios
               </div>
               
               <div className="grid grid-cols-4 gap-2">
                 <Input
                   placeholder="Artículo"
                   value={newShoppingItem.name}
                   onChange={(e) => setNewShoppingItem({ ...newShoppingItem, name: e.target.value })}
                   className="col-span-2"
                 />
                 <Input
                   type="number"
                   placeholder="Cant."
                   value={newShoppingItem.quantity}
                   onChange={(e) => setNewShoppingItem({ ...newShoppingItem, quantity: Number(e.target.value) })}
                 />
                 <Input
                   type="number"
                   placeholder="Precio"
                   value={newShoppingItem.price || ''}
                   onChange={(e) => setNewShoppingItem({ ...newShoppingItem, price: Number(e.target.value) })}
                 />
               </div>
               <Button onClick={addShoppingItem} size="sm" className="gap-2">
                 <Plus className="h-4 w-4" /> Agregar
               </Button>
               
               <div className="space-y-2">
                 {shoppingList.map((item, index) => (
                   <div 
                     key={index}
                     className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                   >
                     <Checkbox
                       checked={item.is_purchased}
                       onCheckedChange={() => toggleShoppingItem(index)}
                     />
                     <span className={`flex-1 ${item.is_purchased ? 'line-through text-muted-foreground' : ''}`}>
                       {item.quantity}x {item.item_name}
                     </span>
                     <span className="font-medium">
                       ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                     </span>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="h-8 w-8"
                       onClick={() => removeShoppingItem(index)}
                     >
                       <X className="h-4 w-4" />
                     </Button>
                   </div>
                 ))}
                 {shoppingList.length > 0 && (
                   <div className="flex justify-between items-center p-2 border-t border-border mt-4">
                     <span className="font-semibold">Total:</span>
                     <span className="text-lg font-bold text-primary">
                       ${totalShoppingPrice.toFixed(2)}
                     </span>
                   </div>
                 )}
                 {shoppingList.length === 0 && (
                   <p className="text-sm text-muted-foreground text-center py-4">
                     No hay artículos en la lista
                   </p>
                 )}
               </div>
             </TabsContent>
             
             <TabsContent value="attachments" className="mt-0 space-y-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                 <Paperclip className="h-4 w-4" />
                 Archivos adjuntos (próximamente)
               </div>
               
               <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                 <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                 <p className="text-sm text-muted-foreground">
                   Arrastra archivos aquí o haz clic para seleccionar
                 </p>
                 <p className="text-xs text-muted-foreground mt-1">
                   Máximo 10MB por archivo
                 </p>
               </div>
             </TabsContent>
           </ScrollArea>
         </Tabs>
         
         <div className="flex justify-between gap-2 pt-4 border-t border-border mt-4">
           {isEditing && (
             <Button 
               variant="destructive" 
               onClick={handleDelete}
               disabled={isLoading}
             >
               <Trash2 className="h-4 w-4 mr-2" />
               Eliminar
             </Button>
           )}
           <div className="flex gap-2 ml-auto">
             <Button variant="outline" onClick={handleClose}>
               Cancelar
             </Button>
             <Button onClick={handleSubmit} disabled={isLoading || !title.trim()}>
               {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
               {isEditing ? 'Guardar' : 'Crear Hito'}
             </Button>
           </div>
         </div>
       </DialogContent>
     </Dialog>
   );
 }