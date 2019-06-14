using System;
using System.Collections.Generic;
using System.Text;

namespace FinalFantasyXIVSquadBuilder.Lib.Interfaces
{
    public interface ISquad
    {
        int ID { get; set; }
        bool Selected { get; set; }
        bool Active { get; set; }
    }
}
