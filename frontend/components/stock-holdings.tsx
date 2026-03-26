"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const holdings = [
    {
        symbol: "RELIANCE.NS",
        company: "Reliance Industries Ltd",
        shares: 50,
        avgPrice: 175.20,
        currentPrice: 189.43,
        gain: "+8.12%",
        value: "₹9,471.50"
    },
    {
        symbol: "ICICIBANK.NS",
        company: "ICICI Bank Ltd",
        shares: 20,
        avgPrice: 242.10,
        currentPrice: 238.45,
        gain: "-1.51%",
        value: "₹4,769.00"
    },
    {
        symbol: "TCS.NS",
        company: "Tata Consultancy Services Ltd",
        shares: 15,
        avgPrice: 410.50,
        currentPrice: 485.35,
        gain: "+18.23%",
        value: "₹7,280.25"
    },
    {
        symbol: "HDFCBANK.NS",
        company: "HDFC Bank Ltd",
        shares: 30,
        avgPrice: 320.15,
        currentPrice: 374.58,
        gain: "+17.00%",
        value: "₹11,237.40"
    },
]

export function StockHoldings() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>My Holdings</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead className="text-right">Shares</TableHead>
                            <TableHead className="text-right">Avg Price</TableHead>
                            <TableHead className="text-right">Gain</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {holdings.map((stock) => (
                            <TableRow key={stock.symbol}>
                                <TableCell className="font-medium">
                                    <div>{stock.symbol}</div>
                                    <div className="text-xs text-muted-foreground">{stock.company}</div>
                                </TableCell>
                                <TableCell className="text-right">{stock.shares}</TableCell>
                                <TableCell className="text-right">₹{stock.avgPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={stock.gain.startsWith('+') ? "default" : "secondary"}>
                                        {stock.gain}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">{stock.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
