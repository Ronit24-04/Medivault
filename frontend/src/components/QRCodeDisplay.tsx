import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  description?: string;
  size?: number;
}

export function QRCodeDisplay({ 
  value, 
  title = "Share via QR Code", 
  description = "Scan this code to access the shared content",
  size = 200 
}: QRCodeDisplayProps) {
  return (
    <Card className="w-fit">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="bg-white p-4 rounded-lg">
          <QRCode 
            value={value} 
            size={size}
            level="M"
          />
        </div>
      </CardContent>
    </Card>
  );
}