import torch
import torch.nn as nn

class PriceLSTM(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_layers, output_dim):
        super(PriceLSTM, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        # LSTM Layer
        self.lstm = nn.LSTM(
            input_dim, 
            hidden_dim, 
            num_layers, 
            batch_first=True
        )
        
        # Fully Connected Layer
        self.fc = nn.Linear(hidden_dim, output_dim)
        
    def forward(self, x):
        # Initialize hidden state with zeros
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).requires_grad_()
        
        # Initialize cell state
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).requires_grad_()
        
        # We need to detach input to prevent backprop through time issues in some contexts,
        # but here we just pass them.
        # h0, c0 defaults to 0 if not provided, but explicit is good.
        h0 = h0.to(x.device)
        c0 = c0.to(x.device)

        out, (hn, cn) = self.lstm(x, (h0, c0))
        
        # Index hidden state of last time step
        # out.size() --> batch_size, seq_length, hidden_dim
        out = self.fc(out[:, -1, :]) 
        return out
