using System;
using System.Collections.Generic;
using System.Text;

namespace FinalFantasyXIVSquadBuilder.Lib.Interfaces
{
    public interface IStatRecord
    {        
        string Name { get; set; }
        int Physical { get; set; }
        int Mental { get; set; }
        int Tactical { get; set; }
    }
}
